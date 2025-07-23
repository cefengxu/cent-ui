import yaml
import os

def load_config():
    """加载YAML配置文件"""
    config_path = os.path.join(os.path.dirname(__file__), 'config.yaml')
    with open(config_path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)

# 加载配置
_config = load_config()

# Flask应用配置
class Config:
    # API配置
    API_BASE_URL = f"http://{_config['api']['ip']}:{_config['api']['port']}{_config['api']['route']}"
    
    # Flask应用配置
    DEBUG = _config['flask']['debug']
    HOST = _config['flask']['host']
    PORT = _config['flask']['port']
    
    # CORS配置
    CORS_ORIGINS = _config['cors']['origins']
    
    # 请求超时设置
    REQUEST_TIMEOUT = _config['api']['request_timeout']
    
    # 默认配置
    DEFAULT_PLAN = _config['defaults']['plan']
    DEFAULT_EXPIRES_IN_DAYS = _config['defaults']['expires_in_days']
    DEFAULT_USAGE_LIMIT = _config['defaults']['usage_limit']
    DEFAULT_CONFIRMATION = _config['defaults']['confirmation'] 