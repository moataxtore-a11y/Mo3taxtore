import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiUsers, FiTarget, FiHeart, FiBookOpen, FiActivity, FiAward, FiSmile, FiArrowLeft, FiUser } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';
import BookLoader from '../components/BookLoader';
import { getIcon } from '../utils/icons';

const AboutUsPage = () => {
  const [content, setContent] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cmsRes, teachersRes] = await Promise.all([
          api.get('/cms/about-us'),
          api.get('/teachers')
        ]);
        setContent(cmsRes.data?.content);
        setTeachers(teachersRes.data?.items || []);
      } catch (err) {
        console.error(err);
        if (err?.response?.status !== 404) {
          toast.error('فشل في تحميل محتوى "من نحن"');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <BookLoader />;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="relative bg-transparent min-h-screen overflow-hidden" dir="rtl">
      {/* Background Decorative Elements */}
      <div className="top-[-10%] right-[-5%] absolute bg-primary/10 blur-[120px] rounded-full w-[500px] h-[500px]"></div>
      <div className="bottom-[-10%] left-[-5%] absolute bg-secondary/10 blur-[120px] rounded-full w-[500px] h-[500px]"></div>

      <div className="z-10 relative mx-auto px-4 pt-28 md:pt-40 pb-20 max-w-7xl">
        {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-12 md:mb-24 text-center"
          >
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-block mb-3 px-6 py-2 font-bold text-primary text-xs md:text-sm uppercase tracking-wider"
            >
              قصتنا بدأت بشغف
            </motion.span>
            <h1 className="mb-4 md:mb-6 font-black text-gradient text-4xl md:text-8xl leading-none md:leading-tight">
              {content?.title || "معتز ستور"}
            </h1>
            <p className="mx-auto max-w-3xl px-2 font-medium text-text-secondary text-lg md:text-2xl leading-relaxed">
              {content?.content?.subtitle || "نحن نعيد تعريف تجربة التعلم من خلال توفير أفضل المصادر التعليمية والكتب التي تلهم العقول وتبني المستقبل."}
            </p>
          </motion.div>

        {/* Full Width Image (Moved UP) */}
        {content?.content?.image && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="shadow-2xl mb-16 md:mb-24 border-2 md:border-4 border-white/20 rounded-[2rem] md:rounded-[3.5rem] overflow-hidden"
          >
            <img
              src={content.content.image}
              alt="About Us"
              className="w-full h-auto md:max-h-[700px] object-cover"
            />
          </motion.div>
        )}

        {/* Vision, Values, Mission cards (Dynamic) */}
        <div className="gap-8 grid grid-cols-1 lg:grid-cols-3 mb-24">
          {(content?.content?.featureCards || []).map((feature, i) => {
            const Icon = getIcon(feature.icon);
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative bg-white/40 shadow-2xl p-10 border border-white/20 rounded-[3rem] overflow-hidden glass"
              >
                <div className="top-0 right-0 absolute bg-primary/5 rounded-full w-32 h-32 group-hover:scale-150 transition-transform -translate-y-1/2 translate-x-1/2 duration-700"></div>
                <div className="flex items-center gap-6 mb-8">
                  <div className="flex justify-center items-center bg-primary/10 rounded-2xl w-16 h-16 text-primary group-hover:rotate-12 transition-transform duration-500">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="font-black text-text-primary text-3xl">{feature.title}</h3>
                </div>
                <p className="text-text-secondary text-lg leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Our Teachers Section */}
        {content?.content?.showTeachers && teachers.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-24"
          >
            <div className="mb-12 text-center">
              <h2 className="mb-4 font-[#31605F] font-black text-text-primary text-2xl md:text-4xl">قدر تشوف الكتب المتاحه لكل مدرس.</h2>
              <p className="mx-auto max-w-2xl font-bold text-text-secondary text-sm md:text-base">ادخل شوف الكتب اللي انت محتاجها.</p>
            </div>

            <div className="gap-4 md:gap-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
              {teachers.map((teacher, i) => (
                <Link
                  key={i}
                  to={`/marketplace?teacherName=${encodeURIComponent(teacher.name)}`}
                  className="block"
                >
                    <motion.div
                      variants={itemVariants}
                      whileHover={{ y: -10 }}
                      className="bg-white/40 shadow-xl hover:shadow-2xl p-4 md:p-6 border border-white/20 rounded-[2rem] md:rounded-[2.5rem] text-center transition-shadow glass"
                    >
                      <div className="bg-primary/5 shadow-lg mx-auto mb-3 md:mb-4 border-2 md:border-4 border-white rounded-full w-16 h-16 md:w-24 md:h-24 overflow-hidden">
                        {teacher.photo ? (
                          <img src={teacher.photo} alt={teacher.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex justify-center items-center h-full text-primary">
                            <FiUser className="w-8 h-8 md:w-10 md:h-10" />
                          </div>
                        )}
                      </div>
                      <h4 className="font-black text-text-primary text-sm md:text-lg truncate">{teacher.name}</h4>
                    </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* Story Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative bg-gradient-to-br from-primary to-primary-dark shadow-[0_20px_50px_rgba(49,96,95,0.3)] mb-16 md:mb-24 p-8 md:p-20 rounded-[2rem] md:rounded-[4rem] overflow-hidden text-white"
        >
          <div className="top-0 right-0 absolute bg-white/10 blur-[100px] rounded-full w-96 h-96 -translate-y-1/2 translate-x-1/2"></div>
          <div className="bottom-0 left-0 absolute bg-secondary/10 blur-[100px] rounded-full w-96 h-96 -translate-x-1/2 translate-y-1/2"></div>

          <div className="z-10 relative flex flex-col items-center text-center">
            <FiBookOpen className="opacity-40 mb-6 md:mb-8 w-12 h-12 md:w-20 md:h-20" />
            <h2 className="mb-6 md:mb-10 font-black text-3xl md:text-6xl text-white">قصتنا</h2>
            <div className="opacity-95 max-w-4xl font-medium text-lg md:text-2xl leading-relaxed md:leading-loose px-2">
              {content?.content?.story ? (
                <p>{content.content.story}</p>
              ) : (
                <p>
                  بدأت فكرة معتز ستور من حاجة الطلاب لمنصة واحدة تجمع أفضل الكتب والمواد الدراسية تحت سقف واحد.
                  نحن نؤمن أن التعليم هو المفتاح لمستقبل أفضل، ولذلك قررنا أن نكون الجسر الذي يربط بين الطالب وبين أفضل الموارد التعليمية المتاحة.
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Dynamic Stats Section (Moved DOWN) */}
        {content?.content?.statsCards && content.content.statsCards.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="gap-4 md:gap-6 grid grid-cols-2 md:grid-cols-4 mb-16 md:mb-24"
          >
            {content.content.statsCards.map((stat, i) => {
              const Icon = getIcon(stat.icon);
              return (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="group bg-white/40 shadow-xl hover:shadow-2xl px-4 md:px-6 py-8 md:py-10 border border-white/40 rounded-[2rem] md:rounded-[2.5rem] text-center transition-all duration-300 glass"
                >
                  <div className="flex justify-center items-center bg-primary/5 mx-auto mb-4 md:mb-6 rounded-2xl w-12 h-12 md:w-16 md:h-16 text-primary text-2xl md:text-3xl group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <div className="mb-1 font-black text-text-primary text-2xl md:text-4xl">{stat.title}</div>
                  <div className="opacity-60 font-bold text-text-muted text-[10px] md:text-sm">{stat.label}</div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* CTA Section */}
        {content?.content?.showCTA && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex flex-col items-center bg-white/30 shadow-2xl p-8 md:p-16 border border-white/20 rounded-[2.5rem] md:rounded-[3.5rem] text-center glass"
          >
            <h2 className="mb-6 md:mb-8 font-black text-text-primary text-3xl md:text-6xl leading-tight">
              {content?.content?.ctaTitle || "ابدأ رحلة التعلم اليوم"}
            </h2>
            <p className="mb-8 md:mb-12 max-w-2xl font-bold text-text-secondary text-base md:text-xl">انضم لمئات الآلاف من الطلاب المتفوقين الذين اختاروا معتز ستور كشريك نجاحهم الأول.</p>
            <Link
              to={content?.content?.ctaLink || "/marketplace"}
              className="flex items-center gap-4 bg-primary shadow-2xl shadow-primary/40 px-8 md:px-12 py-4 md:py-6 border-none rounded-full outline-none font-black text-white text-lg md:text-2xl hover:scale-105 transition-all"
            >
              {content?.content?.ctaButtonText || "تصفح المكتبة الآن"}
              <FiArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AboutUsPage;
