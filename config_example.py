# 配置文件示例
# 复制此文件为 config.py 并修改相应的值

class Config:
    # =================== API配置 ===================
    # 后端API的基础URL - 根据您的实际部署环境修改
    API_BASE_URL = "http://10.176.14.88:8888/api/v1"
    
    # =================== Flask应用配置 ===================
    # 是否开启调试模式
    DEBUG = True
    
    # 服务器监听地址 ('0.0.0.0' 表示所有接口)
    HOST = '0.0.0.0'
    
    # 服务器监听端口
    PORT = 8887
    
    # =================== 跨域配置 ===================
    # 允许跨域的来源 ("*" 表示所有来源)
    CORS_ORIGINS = "*"
    
    # =================== 请求配置 ===================
    # HTTP请求超时时间（秒）
    REQUEST_TIMEOUT = 30
    
    # =================== 业务默认配置 ===================
    # 默认计划类型
    DEFAULT_PLAN = 'free'
    
    # 默认有效期（天）
    DEFAULT_EXPIRES_IN_DAYS = 30
    
    # 默认使用限制
    DEFAULT_USAGE_LIMIT = 100
    
    # 删除确认字符串
    DEFAULT_CONFIRMATION = 'CONFIRM_DELETE'


# =================== 开发环境配置 ===================
class DevelopmentConfig(Config):
    DEBUG = True
    HOST = '127.0.0.1'
    PORT = 8887


# =================== 生产环境配置 ===================
class ProductionConfig(Config):
    DEBUG = False
    HOST = '0.0.0.0'
    PORT = 8887
    REQUEST_TIMEOUT = 10


# =================== 测试环境配置 ===================
class TestConfig(Config):
    DEBUG = True
    API_BASE_URL = "http://test-api.example.com/api/v1"
    HOST = '127.0.0.1'
    PORT = 8888 