import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const price = product.discount_price || product.price;
  const discount = product.discount_price 
    ? Math.round(((product.price - product.discount_price) / product.price) * 100) 
    : 0;

  return (
    <div className="card group">
      <Link to={`/product/${product.id}`} className="block">
        {/* Image */}
        <div className="relative overflow-hidden rounded-lg mb-4 bg-gray-100 aspect-square">
          <img
            src={product.images ? JSON.parse(product.images)?.[0] || '/placeholder.jpg' : '/placeholder.jpg'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300x300?text=' + encodeURIComponent(product.name);
            }}
          />
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{discount}%
            </span>
          )}
          {!product.stock && (
            <span className="absolute top-2 right-2 bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded">
              Out of Stock
            </span>
          )}
        </div>

        {/* Info */}
        <h3 className="font-medium text-gray-800 mb-1 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {product.name}
        </h3>
        
        {product.brand && (
          <p className="text-sm text-gray-500 mb-2">{product.brand}</p>
        )}

        {/* Rating */}
        <div className="flex items-center mb-2">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <span key={i}>{i < (product.average_rating || 4) ? '★' : '☆'}</span>
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-1">({product.review_count || 0})</span>
        </div>

        {/* Price */}
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold text-primary-600">
            ৳{price.toLocaleString('en-BD')}
          </span>
          {product.discount_price && (
            <span className="text-sm text-gray-400 line-through">
              ৳{product.price.toLocaleString('en-BD')}
            </span>
          )}
        </div>
      </Link>

      {/* Add to Cart Button */}
      <button 
        className={`w-full mt-3 btn-primary ${!product.stock ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={!product.stock}
      >
        {product.stock ? 'Add to Cart' : 'Out of Stock'}
      </button>
    </div>
  );
};

export default ProductCard;
