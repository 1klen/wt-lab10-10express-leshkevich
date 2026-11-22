
//___________Тесты____________
// http://localhost:3000
// http://localhost:3000/api/info должен принять инфу
// http://localhost:3000/api/products - список товаров
// http://localhost:3000/api/db-test - тестовый запрос

//____________отправка post-запросов_____________
// curl -s http://localhost:3000/api/info
// curl -s -X POST http://localhost:3000/api/test \
//   -H "Content-Type: application/json" \
//   -d '{"name":"Ноутбук","price":2500}'

//____Добавление товара__________
curl -i -s -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"brandModel":"Mercedes-Benz W211 3.2","category":"Avantgarde","pricePerDay":120,"isAvailable":true,"description":"Комфортный седан"}'

//____Изменение товара__________
curl -i -s -X PUT http://localhost:3000/api/products/3 \
  -H "Content-Type: application/json" \
  -d '{"brandModel":"Mercedes-Benz W211 3.2","category":"Avantgarde","pricePerDay":150,"isAvailable":true,"description":"Обновлённое описание"}'