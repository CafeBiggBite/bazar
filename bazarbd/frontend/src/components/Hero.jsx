import { Link } from 'react-router-dom';
import { TrendingUp, Award, Truck, RefreshCcw } from 'lucide-react';

const Hero = () => {
  return (
    <section className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white py-16">
      <div className="container-custom">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Welcome to
              <span className="block text-yellow-300">BazarBD</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-100">
              Bangladesh's Premier Online Shopping Destination. 
              Discover amazing products at unbeatable prices with nationwide delivery.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products" className="bg-white text-primary-700 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors">
                Shop Now
              </Link>
              <Link to="/deals" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-700 transition-colors">
                View Deals
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <div>
                <p className="text-3xl font-bold">50K+</p>
                <p className="text-primary-200 text-sm">Products</p>
              </div>
              <div>
                <p className="text-3xl font-bold">100K+</p>
                <p className="text-primary-200 text-sm">Customers</p>
              </div>
              <div>
                <p className="text-3xl font-bold">64</p>
                <p className="text-primary-200 text-sm">Districts</p>
              </div>
            </div>
          </div>
          
          <div className="hidden md:block">
            <img 
              src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&h=600&fit=crop" 
              alt="Shopping" 
              className="rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

const Features = () => {
  const features = [
    {
      icon: <Truck size={32} />,
      title: 'Nationwide Delivery',
      description: 'Free delivery on orders over ৳500'
    },
    {
      icon: <RefreshCcw size={32} />,
      title: 'Easy Returns',
      description: '7 days return policy'
    },
    {
      icon: <Award size={32} />,
      title: 'Genuine Products',
      description: '100% authentic guaranteed'
    },
    {
      icon: <TrendingUp size={32} />,
      title: 'Best Prices',
      description: 'Price match guarantee'
    }
  ];

  return (
    <section className="py-12 bg-white">
      <div className="container-custom">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-full mb-4">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { Hero, Features };
