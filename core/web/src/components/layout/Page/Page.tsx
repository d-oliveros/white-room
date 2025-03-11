import { Outlet } from 'react-router-dom';
import PageContainer from '@web/components/layout/PageContainer/PageContainer';
import NavbarConnected from '@web/components/layout/Navbar/NavbarConnected';

const Page = () => {
  return (
    <div className="size-full">
      <header>
        <NavbarConnected />
      </header>
      <main>
        <div style={{ minHeight: 'calc(100vh - 225px)' }}>
          <PageContainer>
            <Outlet />
          </PageContainer>
        </div>
      </main>
    </div>
  );
};

export default Page;
