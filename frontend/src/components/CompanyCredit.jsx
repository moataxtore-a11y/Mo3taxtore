import { FiExternalLink } from 'react-icons/fi';

const COMPANY_URL = 'https://3mtechs.com';

const CompanyCredit = ({ isRtl = true, className = '' }) => (
  <a
    href={COMPANY_URL}
    target="_blank"
    rel="noopener noreferrer"
    dir={isRtl ? 'rtl' : 'ltr'}
    className={`inline-flex items-center gap-1.5 underline decoration-current/50 underline-offset-4 transition-colors hover:decoration-current ${className}`}
  >
    <span>
      {isRtl ? 'تصميم وتنفيذ بواسطة ' : 'Designed & Built by '}
      <bdi dir="ltr">3M Tech</bdi>
    </span>
    <FiExternalLink aria-hidden="true" className="w-3.5 h-3.5 shrink-0" />
  </a>
);

export default CompanyCredit;
