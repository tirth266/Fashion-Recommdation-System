import Footer from './Footer';

export default function MainLayout({ children }) {
     return (
          <div className="min-h-screen bg-background text-primary selection:bg-black selection:text-white dark:bg-black dark:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-300">
               <main className="w-full">
                    {children}
               </main>
               <Footer />
          </div>
     );
}
