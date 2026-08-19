const savedProducts = JSON.parse(localStorage.getItem('fitstore_products') || '[]');
export const products = savedProducts;

export const categories = [
  { name: "Equipment", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80" },
  { name: "Apparel", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80" },
  { name: "Supplements", image: "https://images.unsplash.com/photo-1579722820308-d74e571900a9?auto=format&fit=crop&w=800&q=80" },
  { name: "Accessories", image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=800&q=80" }
];

export const orders = [];
