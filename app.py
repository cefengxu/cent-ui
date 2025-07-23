from flask import Flask, render_template, jsonify, request
import requests
from flask_cors import CORS
from config import Config

app = Flask(__name__)
CORS(app)

# API基础URL
API_BASE_URL = Config.API_BASE_URL

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/users')
def get_users():
    """获取用户列表的代理接口"""
    try:
        response = requests.get(f"{API_BASE_URL}/users/", timeout=Config.REQUEST_TIMEOUT)
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/create-key', methods=['POST'])
def create_api_key():
    """创建API密钥的代理接口"""
    try:
        data = request.json
        email = data.get('email')
        
        # 构建请求参数
        params = {'email': email}
        payload = {
            'app_id': data.get('app_id'),
            'plan': data.get('plan', Config.DEFAULT_PLAN),
            'expires_in_days': data.get('expires_in_days', Config.DEFAULT_EXPIRES_IN_DAYS),
            'usage_limit': data.get('usage_limit', Config.DEFAULT_USAGE_LIMIT)
        }
        
        response = requests.post(
            f"{API_BASE_URL}/api-keys/create",
            params=params,
            json=payload,
            headers={'Content-Type': 'application/json'},
            timeout=Config.REQUEST_TIMEOUT
        )
        
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/revoke-key', methods=['DELETE'])
def revoke_api_key():
    """吊销API密钥的代理接口"""
    try:
        data = request.json
        api_key = data.get('api_key')
        app_id = data.get('app_id')
        
        response = requests.delete(
            f"{API_BASE_URL}/api-keys/{api_key}",
            params={'app_id': app_id},
            timeout=Config.REQUEST_TIMEOUT
        )
        
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/delete-user', methods=['DELETE'])
def delete_user():
    """删除用户的代理接口"""
    try:
        data = request.json
        
        # 构建请求数据
        payload = {
            'email': data.get('email'),
            'app_id': data.get('app_id'),
            'confirmation': data.get('confirmation', Config.DEFAULT_CONFIRMATION),
            'admin_email': data.get('admin_email'),
            'admin_app_id': data.get('admin_app_id')
        }
        
        response = requests.delete(
            f"{API_BASE_URL}/users/admin/delete-simple",
            json=payload,
            headers={'Content-Type': 'application/json'},
            timeout=Config.REQUEST_TIMEOUT
        )
        
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=Config.DEBUG, host=Config.HOST, port=Config.PORT) 