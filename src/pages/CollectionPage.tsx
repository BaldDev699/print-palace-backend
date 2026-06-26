
import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import signatureTeeImage from '@/assets/collection-signature-tee.jpg';
import artisanHoodieImage from '@/assets/collection-artisan-hoodie.jpg';
import innovatorCapImage from '@/assets/collection-innovator-cap.jpg';
import explorerJacketImage from '@/assets/collection-explorer-jacket.jpg';
import creatorToteImage from '@/assets/collection-creator-tote.jpg';
import varsityJacketImage from '@/assets/collection-varsity-jacket.jpg';

const collectionItems = [
  { 
    id: 1, 
    name: "Roge Signature Tee", 
    imageUrl: signatureTeeImage, 
    description: "Our classic tee, embodying minimalist style and comfort. Made with 100% organic cotton.",
    price: "$29.99"
  },
  { 
    id: 2, 
    name: "Roge Artisan Hoodie", 
    imageUrl: artisanHoodieImage, 
    description: "A premium hoodie featuring a unique handcrafted design. Perfect for a stylish, relaxed look.",
    price: "$59.99"
  },
  { 
    id: 3, 
    name: "The Innovator Cap", 
    imageUrl: innovatorCapImage, 
    description: "Sleek and modern, this cap is designed for the forward-thinkers. Adjustable fit.",
    price: "$24.99"
  },
   { 
    id: 4, 
    name: "Urban Explorer Jacket", 
    imageUrl: explorerJacketImage, 
    description: "Lightweight and versatile jacket for all your urban adventures. Water-resistant.",
    price: "$89.99"
  },
  { 
    id: 5, 
    name: "Canvas Creator Tote", 
    imageUrl: creatorToteImage, 
    description: "Durable canvas tote bag, spacious enough for all your creative essentials.",
    price: "$34.99"
  },
  { 
    id: 6, 
    name: "Visionary Varsity Jacket", 
    imageUrl: varsityJacketImage, 
    description: "A modern take on the classic varsity jacket, for those who lead with vision.",
    price: "$129.99"
  },
];

const CollectionPage = () => {
  const featuredItem = collectionItems.length > 0 ? collectionItems[0] : null;
  const otherItems = collectionItems.length > 1 ? collectionItems.slice(1) : [];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section className="text-center mb-16">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-primary mb-6 tracking-tight">
            Roge Collection
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore exclusive designs by Roge. Each piece embodies a unique blend of artistry, quality, and modern aesthetics, crafted for the discerning individual.
          </p>
        </section>
        
        {featuredItem && (
          <section className="mb-16">
            <Card key={featuredItem.id} className="overflow-hidden shadow-2xl flex flex-col md:flex-row group rounded-lg">
              <div className="md:w-3/5 lg:w-2/3 overflow-hidden">
                <img 
                  src={featuredItem.imageUrl} 
                  alt={featuredItem.name} 
                  className="w-full h-80 md:h-[500px] object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                />
              </div>
              <div className="md:w-2/5 lg:w-1/3 flex flex-col bg-card"> {/* Ensure card background for text area */}
                <CardHeader className="pb-3 pt-6 px-6 md:pt-8">
                  <CardTitle className="text-3xl lg:text-4xl font-bold text-card-foreground">{featuredItem.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow px-6">
                  <CardDescription className="text-base mb-4 text-muted-foreground">{featuredItem.description}</CardDescription>
                  <p className="font-bold text-2xl text-primary mb-6">{featuredItem.price}</p>
                </CardContent>
                <div className="p-6 pt-0">
                  <Button className="w-full text-lg py-3" size="lg" asChild>
                    <Link to={`/designer?template=${encodeURIComponent(featuredItem.name)}`}>Customize & Buy</Link>
                  </Button>
                </div>
              </div>
            </Card>
          </section>
        )}
        
        {otherItems.length > 0 && (
          <section>
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-12 text-center">
              Discover More
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {otherItems.map(item => (
                <Card key={item.id} className="overflow-hidden flex flex-col group rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out">
                  <div className="overflow-hidden">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="w-full h-64 object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl font-semibold">{item.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <CardDescription className="text-sm mb-3 text-muted-foreground">{item.description}</CardDescription>
                    <p className="font-semibold text-lg text-primary mb-4">{item.price}</p>
                  </CardContent>
                  <div className="p-6 pt-0">
                     <Button className="w-full" asChild>
                      <Link to={`/designer?template=${encodeURIComponent(item.name)}`}>Customize & Buy</Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CollectionPage;
