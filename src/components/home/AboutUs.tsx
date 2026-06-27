import React from "react";

const AboutUs = () => {
  return (
    <section id="about-us" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-6">About Roge</h2>
            <p className="text-lg text-muted-foreground mb-4">
              We began as passionate individuals who loved the art of printing on garments. As we
              grew, we envisioned a way to simplify the custom printing process for everyone.
            </p>
            <p className="text-lg text-muted-foreground mb-8">
              Our goal became clear: to develop an easy-to-use model that empowers our clients to
              design and order their unique pieces right from the comfort of their homes. We're
              dedicated to making custom printing accessible, creative, and enjoyable.
            </p>
          </div>
          <div>
            <img
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"
              alt="Person designing on a laptop"
              className="rounded-lg shadow-xl w-full h-auto object-cover max-h-[400px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
