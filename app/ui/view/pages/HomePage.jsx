const HomePage = () => {
  return (
    <div>
      <h1 className="text-3xl">
        Home Page
      </h1>
      <p>
        Page content.
      </p>
    </div>
  );
};

HomePage.getMetadata = () => ({
  pageTitle: 'Home Page | White Room',
});

export default HomePage;
