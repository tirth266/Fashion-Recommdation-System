import Navbar from './Navbar';
import Footer from './Footer';

export default function MainLayout({ children }) {
     return (
          <div className="min-h-screen bg-background text-primary selection:bg-black selection:text-white">
               <Navbar />
               <main className="w-full">
                    {children}
               </main>
               <Footer />
          </div>
     );
}
