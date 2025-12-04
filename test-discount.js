// Test script to create a product with discount via the API
const testProduct = {
  name: 'Test Flash Deal Product',
  description: 'This is a test product with discount',
  price: 100,
  category: 'Test Category',
  stock: 50,
  featured: false,
  discount: 30,
  imageUrl: 'https://via.placeholder.com/300x300?text=Test+Product'
};

// Get admin token (you would need to login first)
const token = 'YOUR_ADMIN_TOKEN'; // You need to get this from login

fetch('http://localhost:3000/api/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(testProduct)
})
.then(res => res.json())
.then(data => {
  console.log('Product created:', data);
})
.catch(err => console.error('Error:', err));
