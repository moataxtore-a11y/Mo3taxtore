import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaWhatsapp, FaTiktok } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import api from '../services/api';
import logo from '../assets/LOGO.svg';
import footerSvg from '../assets/footer.svg';

const Footer = () => {
  const [footerSettings, setFooterSettings] = useState({
    facebook: '#',
    instagram: '#',
    whatsapp: '#',
    tiktok: '#',
    developerName: 'Moataz',
    developerLink: '#',
  });

  useEffect(() => {
    const fetchFooterSettings = async () => {
      try {
        const res = await api.get('/cms/footer-settings');
        if (res.data && res.data.content && res.data.content.content) {
          setFooterSettings(prev => ({ ...prev, ...res.data.content.content }));
        }
      } catch (err) {
        if (err.response?.status !== 404) {
          console.error('Fetch footer settings error:', err);
        }
      }
    };
    fetchFooterSettings();
  }, []);

  const normalizeLink = (link) => {
    if (!link || typeof link !== 'string') return '#';
    const trimmedLink = link.trim();
    if (!trimmedLink || trimmedLink === '#') return '#';
    const lowerLink = trimmedLink.toLowerCase();
    if (lowerLink.startsWith('http://') || lowerLink.startsWith('https://') || lowerLink.startsWith('mailto:') || lowerLink.startsWith('tel:')) {
      return trimmedLink;
    }
    return `https://${trimmedLink}`;
  };

  const socialItems = [
    { Icon: FaTiktok, color: 'text-black', bg: 'bg-white', link: normalizeLink(footerSettings.tiktok) },
    { Icon: FaInstagram, color: 'text-[#ee2a7b]', bg: 'bg-white', link: normalizeLink(footerSettings.instagram) },
    { Icon: FaWhatsapp, color: 'text-[#25D366]', bg: 'bg-white', link: normalizeLink(footerSettings.whatsapp) },
    { Icon: FaFacebook, color: 'text-[#1877F2]', bg: 'bg-white', link: normalizeLink(footerSettings.facebook) },
  ];

  return (
    <footer id="footer" className="relative pt-32 pb-40 lg:pb-24 overflow-hidden font-body text-[#1E2F2E] bg-gradient-to-t from-[#D6E4E3] to-transparent mt-10">

      {/* Footer Curtain Banner */}
      <div className="absolute top-0 left-0 w-full pointer-events-none z-0">
        <img src={footerSvg} alt="Footer Decor" className="w-full h-auto object-cover min-h-[60px]" />
      </div>

      {/* Soft floating background blob */}
      <motion.div
        animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[100%] rounded-[50%] bg-[#31605F]/5 filter blur-[100px] pointer-events-none"
      />

      <div className="z-10 relative flex flex-col items-center mx-auto px-4 max-w-7xl text-center">
        {/* Logo and Tagline */}
        <div className="mb-8">
          <Link
            to="/"
            onClick={(e) => {
              if (window.location.pathname === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="inline-block hover:scale-105 transition-transform duration-300"
          >
            <img 
              src={logo} 
              alt="Moataz Logo" 
              className="mx-auto mb-4 w-auto h-20 md:h-32 lg:h-48 object-contain drop-shadow-xl"
            />
          </Link>
          <p className="font-medium text-[#5F7A79] text-lg tracking-wide max-w-sm mx-auto leading-relaxed">
            وفرنالك كل الكتب اللي محتاجها في مكان واحد.
            <br /> <span className="text-[#31605F] font-bold">#سهل #سريع #آمن</span>
          </p>
        </div>

        {/* Social Icons Playground */}
        <div className="flex items-center gap-6 mb-12">
          {socialItems.map((item, i) => (
            <motion.a
              key={i}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.15, rotate: i % 2 === 0 ? 5 : -5, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className={`flex justify-center items-center ${item.bg} shadow-md hover:shadow-xl hover:shadow-[#31605F]/10 rounded-[1.2rem] w-14 h-14 transition-all`}
            >
              <item.Icon className={`${item.color} text-2xl drop-shadow-sm`} />
            </motion.a>
          ))}
        </div>

        {/* Quick Links for New Pages */}
        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-4 mb-10 font-black text-[#31605F] text-sm md:text-base uppercase tracking-tighter">
          <Link to="/best-sellers" className="hover:text-[#5F7A79] transition-all hover:scale-105">الأكثر مبيعاً</Link>
          <Link to="/about" className="hover:text-[#5F7A79] transition-all hover:scale-105">من نحن</Link>
          <Link to="/faq" className="hover:text-[#5F7A79] transition-all hover:scale-105">الأسئلة الشائعة</Link>
          <Link to="/marketplace" className="hover:text-[#5F7A79] transition-all hover:scale-105">الكتب</Link>
        </div>

        {/* Soft Divider */}
        <div className="bg-gradient-to-r from-transparent via-[#8FA7A6]/30 to-transparent mb-8 w-full max-w-lg h-px" />

        {/* Copyright and Credits */}
        {/* Copyright and Credits */}
        <div className="flex md:flex-row flex-col items-center gap-3 mb-2 text-[#5F7A79] text-sm font-medium">
          <div className="flex items-center gap-2">
            جميع الحقوق محفوظة | معتز ستور © {new Date().getFullYear()}
          </div>
          <div className="hidden md:block bg-[#8FA7A6] rounded-full w-1.5 h-1.5" />
          <div className="flex items-center gap-1">
            تم التطوير بواسطة
            <a
              href={normalizeLink(footerSettings.developerLink)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#31605F] font-bold hover:underline transition-all"
              onClick={(e) => {
                const link = normalizeLink(footerSettings.developerLink);
                if (link && link !== '#') {
                  window.open(link, '_blank');
                  e.preventDefault();
                }
              }}
            >
              {footerSettings.developerName || 'Moataz'}
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
