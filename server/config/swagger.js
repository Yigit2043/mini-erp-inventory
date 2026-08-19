const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mini ERP API',
      version: '1.0.0',
      description: 'Stok, sipariş, müşteri ve fatura yönetimi için REST API dokümantasyonu',
    },
    servers: [
      { url: 'http://localhost:5000', description: 'Yerel geliştirme' },
      { url: 'https://mini-erp-backend-1c4y.onrender.com', description: 'Canlı sunucu' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./routes/*.js'], // Swagger yorumlarını hangi dosyalarda arayacağı
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;