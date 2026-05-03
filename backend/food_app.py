from flask import Flask, request, jsonify
from flask_cors import CORS
from services import calculate_prep

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://127.0.0.1:5173"])

@app.route('/api/calculate', methods=['POST'])
def calculate():
    data = request.get_json()
    result = calculate_prep(data)
    return jsonify(result)

@app.route('/')
def index():
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)