import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')
from matplotlib.backends.backend_pdf import PdfPages
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error

from flask import Flask, request, jsonify, send_file, abort
from flask_cors import CORS
import io

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

# === Глобальные переменные ===
df_raw: pd.DataFrame = None  # Исходные данные
df_processed: pd.DataFrame = None  # Обработанные данные
model: LinearRegression = None


def clean_raw_data(df: pd.DataFrame) -> pd.DataFrame:
    df_clean = df.copy()
    
    df_clean = df_clean.drop(['contact', 'poutcome'], axis=1, errors='ignore')
    
    df_clean = df_clean[df_clean.get('education', '') != 'unknown']
    
    if 'job' in df_clean.columns:
        valid_jobs = df_clean[df_clean['job'] != 'unknown']['job']
        replacement = valid_jobs.mode()[0] if not valid_jobs.empty else 'unemployed'
        df_clean['job'] = df_clean['job'].replace('unknown', replacement)
    
    return df_clean

# === Подготовка данных ===
def prepare_data(df_raw: pd.DataFrame) -> pd.DataFrame:
    df = df_raw.copy()

    # Бинаризация целевой переменной
    df["y"] = df["y"].map({'yes': 1, 'no': 0})

    # Категоризация занятости
    df['is_employed'] = df['job'].apply(lambda x: 0 if x in ['unemployed', 'retired', 'student'] else 1)
    df = df.drop('job', axis=1)

    # marital числовые
    df["marital"] = df["marital"].replace({'single': 0, 'married': 1, 'divorced': 2})

    # education числовые
    df["education"] = df["education"].replace({'primary': 0, 'secondary': 1, 'tertiary': 2})

    # default, housing, loan  числовые
    df["default"] = df["default"].replace({'yes': 1, 'no': 0})
    df["housing"] = df["housing"].replace({'yes': 1, 'no': 0})
    df["loan"] = df["loan"].replace({'yes': 1, 'no': 0})

    # month переводим в числа
    month_mapping = {
        'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4,
        'may': 5, 'jun': 6, 'jul': 7, 'aug': 8,
        'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
    }
    df['month_int'] = df['month'].map(month_mapping)
    df = df.drop(['month'], axis=1)

    return df

# === Модель ===
def train_model(df: pd.DataFrame) -> LinearRegression:
    X = df.drop('y', axis=1)
    y = df['y']

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.9, random_state=228
    )

    model = LinearRegression()
    model.fit(X_train, y_train)
    test_predictions = model.predict(X_test)

    return model


# === Эндпоинты ===

@app.route('/upload', methods=['POST'])
def upload():
    global df_raw, df_processed, model

    if 'file' not in request.files:
        abort(400, description='Нет файла в запросе')
    file = request.files['file']

    try:
        # Чтение исходных данных
        raw = pd.read_csv(file, sep=';')
        
        # Очистка исходных данных
        df_raw = clean_raw_data(raw)
        
        # Подготовка обработанных данных
        df_processed = prepare_data(df_raw)
        model = train_model(df_processed)

    except Exception as e:
        import traceback
        abort(400, description=f'Не удалось прочитать CSV: {e}')

    return jsonify({'status': 'ok', 'rows': len(df_processed)})


@app.route('/columns', methods=['GET'])
def get_columns():
    """Возвращает список всех доступных колонок"""
    if df_raw is None:
        abort(400, description='Данные не загружены. Сначала POST /upload')

    columns = list(df_raw.columns)
    return jsonify({"columns": columns})


@app.route('/column-values', methods=['GET'])
def get_column_values():
    """Возвращает все уникальные значения для указанной колонки"""
    col = request.args.get("col")
    if not col or col not in df_raw.columns:
        abort(400, description="Колонка не указана или не существует")

    unique_values = df_raw[col].unique().tolist()
    return jsonify({"values": unique_values})


@app.route('/plot', methods=['GET'])
def plot():
    """Генерирует гистограмму по двум фильтрам и целевой переменной"""
    global df_raw

    if df_raw is None:
        abort(400, description='Данные не загружены. Сначала POST /upload')

    args = request.args
    required = ['filter1_col', 'filter1_val', 'filter2_col', 'filter2_val', 'target_col']

    for p in required:
        if p not in args:
            abort(400, description=f'Параметр {p} обязателен')

    f1c = args['filter1_col']
    f1v = args['filter1_val']
    f2c = args['filter2_col']
    f2v = args['filter2_val']
    tc = args['target_col']

    if any(col not in df_raw.columns for col in [f1c, f2c, tc]):
        abort(400, description='Указаны недопустимые колонки')

    try:
        sub = df_raw[(df_raw[f1c].astype(str) == f1v) & 
                     (df_raw[f2c].astype(str) == f2v)]

        if sub.empty:
            abort(400, description='Фильтр дал пустую выборку')

        plt.figure(figsize=(12, 8), dpi=300)
        sns.histplot(sub[tc], bins=20, kde = True, color = '#3300FF', alpha = 0.8, edgecolor = 'w') # САМ ГРАФИК
        plt.title(f'Распределение "{tc}"\nФильтры: {f1c}={f1v}, {f2c}={f2v}', fontsize=12)
        plt.xlabel(tc, fontsize=10)
        plt.ylabel('Частота', fontsize=10)
        plt.grid(axis='y', alpha=0.25)

        plt.tight_layout()

        buf = io.BytesIO()
        plt.savefig(buf, format='png')
        plt.close()
        buf.seek(0)

        return send_file(buf, mimetype='image/png')

    except ValueError as ve:
        abort(400, description=f'Ошибка преобразования типа: {ve}')
    except Exception as e:
        abort(500, description=f'Ошибка генерации графика: {e}')


@app.route('/report', methods=['GET'])
def generate_report():
    """Генерирует PDF-отчет с гистограммой по двум фильтрам"""
    global df_raw

    if df_raw is None:
        abort(400, description='Данные не загружены. Сначала POST /upload')

    args = request.args
    required = ['filter1_col', 'filter1_val', 'filter2_col', 'filter2_val', 'target_col']

    for p in required:
        if p not in args:
            abort(400, description=f'Параметр {p} обязателен')

    f1c = args['filter1_col']
    f1v = args['filter1_val']
    f2c = args['filter2_col']
    f2v = args['filter2_val']
    tc = args['target_col']

    if any(col not in df_raw.columns for col in [f1c, f2c, tc]):
        abort(400, description='Указаны недопустимые колонки')

    try:
        sub = df_raw[
            (df_raw[f1c].astype(str) == str(f1v)) & 
            (df_raw[f2c].astype(str) == str(f2v))]

        if sub.empty:
            abort(400, description='Фильтр дал пустую выборку')

        plt.figure(figsize=(12, 8), dpi=300)
        sns.histplot(sub[tc], bins=20, kde = True, color = '#3300FF', alpha = 0.8, edgecolor = 'w') # САМ ГРАФИК

        plt.title(f'Распределение "{tc}"\nФильтры: {f1c}={f1v}, {f2c}={f2v}', fontsize=12)
        plt.xlabel(tc, fontsize=10)
        plt.ylabel('Частота', fontsize=10)
        plt.grid(axis='y', alpha=0.25)
        plt.tight_layout()

        # Создаем PDF-документ
        buf = io.BytesIO()
        with PdfPages(buf) as pdf:
            pdf.savefig(bbox_inches='tight')  # Сохраняем текущую фигуру в PDF
            # Добавляем метаданные
            d = pdf.infodict()
            d['Title'] = 'Аналитический отчет'
            d['Author'] = 'Bank Marketing Analytics'
        
        plt.close()
        buf.seek(0)

        return send_file(
            buf,
            mimetype='application/pdf',
            as_attachment=True,
            download_name='data_report.pdf'
        )

    except ValueError as ve:
        abort(400, description=f'Ошибка преобразования типа: {ve}')
    except Exception as e:
        abort(500, description=f'Ошибка генерации отчета: {e}')


@app.route('/table', methods=['GET'])
def table():
    """Возвращает обработанные данные для отображения в таблице"""
    global df_processed  # Используем обработанные данные
    
    if df_processed is None:
        abort(400, description='Данные не загружены. Сначала POST /upload')
    
    # Возвращаем первые 100 строк обработанных данных
    return jsonify(df_processed.head(100).to_dict(orient='records'))


@app.route('/predict', methods=['POST'])
def predict():
    global model, df_processed
    if model is None:
        abort(400, description='Модель не обучена. Сначала POST /upload')

    data = request.get_json()

    # Проверяем наличие всех необходимых полей
    required_fields = [
        'age', 'marital', 'education', 'default', 'balance',
        'housing', 'loan', 'day', 'duration', 'campaign',
        'pdays', 'previous', 'is_employed', 'month_int'
    ]

    missing = [field for field in required_fields if field not in data]
    if missing:
        abort(400, description=f'Отсутствуют поля: {", ".join(missing)}')

    try:
        # Преобразуем данные в DataFrame
        input_df = pd.DataFrame([data])

        # Делаем предсказание
        prediction = model.predict(input_df)[0]

        # Возвращаем результат
        return jsonify({
            'deposit_subscribed': bool(round(prediction)),
            'raw_prediction': float(prediction)
        })

    except Exception as e:
        abort(500, description=f'Ошибка предсказания: {e}')


if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=5000)