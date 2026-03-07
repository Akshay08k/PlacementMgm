import { HiSparkles } from "react-icons/hi";


const Footer = () => {
    <>
      <footer className="mt-10 bg-gray-900 text-white py-10">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-6 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <HiSparkles className="text-white text-xs" />
              </div>
              <span className="font-bold text-sm">LJ University Placement</span>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed">Empowering futures, one placement at a time.</p>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-3">Quick Links</h4>
            <ul className="space-y-1.5 text-gray-400 text-xs">
              {['About Us', 'Contact', 'Privacy Policy', 'Terms of Service'].map(l => <li key={l}><a href="#" className="hover:text-emerald-400 transition-colors">{l}</a></li>)}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-3">Contact Us</h4>
            <ul className="space-y-1.5 text-gray-400 text-xs">
              <li>LJ University Campus, Ahmedabad</li>
              <li>placements@ljku.edu.in</li>
              <li>+91 XXX XXX XXXX</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 border-t border-gray-800 pt-5 text-center text-gray-500 text-xs">
          © 2024 LJ University. All rights reserved.
        </div>
      </footer>
    </>
}


export default Footer;