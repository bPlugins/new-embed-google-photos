import { Outlet, Link, useLocation } from 'react-router-dom';

import Header from '../../../../bpl-tools/Admin/Header';
import { docsUrl } from '../utils/data';

const navigation = [
    { name: 'Welcome', href: '/welcome' },
    { name: 'Demos', href: '/demos' },
    { name: 'Documentation', href: docsUrl, external: true },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Feature Comparison', href: '/feature-comparison' },
    // { name: 'Our Plugins', href: '/our-plugins' },
];

const Layout = (props) => {
    const { isPremium, hasPro } = props;

    const location = useLocation();

    return <div className='bPlDashboard'>
        <Header {...props}>
            <nav className='bPlDashboardNav'>
                {navigation
                    ?.filter(item => item.href !== '/activation' || hasPro) // Hide activation link for non-pro users
                    ?.filter(item => !isPremium || !['/purchase', '/pricing', '/feature-comparison'].includes(item.href)) // Hide link for premium users
                    ?.map((item, index) => item.external
                        ? <a
                            key={index}
                            href={item.href}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='navLink'
                        >
                            {item.name}
                        </a>
                        : <Link
                            key={index}
                            to={item.href}
                            className={`navLink ${location.pathname === item.href ? 'active' : ''}`}
                        >
                            {item.name}
                        </Link>)}
            </nav>
        </Header>

        <main className='bPlDashboardMain'>
            <Outlet />
        </main>
    </div>;
};
export default Layout;
