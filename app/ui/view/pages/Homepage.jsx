import Link from '#ui/view/components/Link/Link.jsx';

const HomePage = () => {
  return (
    <div>
      <h1 className='text-3xl font-bold underline'>
        Home Page!
      </h1>

      <Link to='/sandbox'>Go to Sandbox Page</Link>
    </div>
  );
};

HomePage.getMetadata = () => ({
  pageTitle: 'Home Page | White Room',
});

export default HomePage;
