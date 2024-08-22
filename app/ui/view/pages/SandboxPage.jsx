import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useServiceQuery, useServiceMutation } from '#whiteroom/client/hooks/reactQuery.js';

import { hasRoleAnonymous } from '#user/constants/roles.js';
import sleepAsync from '#whiteroom/util/sleepAsync.js';
import logger from '#whiteroom/logger.js';

import useBranch from '#whiteroom/client/hooks/useBranch.js';
import useDispatch from '#whiteroom/client/hooks/useDispatch.js';

import Link from '#ui/view/components/Link/Link.jsx';
import Card from '#ui/view/components/Card/Card.jsx';
import Button from '#ui/view/components/Button/Button.jsx';

// import './pages.css';

const debug = logger.createDebug('SandboxPage');

const getPostsQueryParams = {
  serviceId: 'post/getList',
  payload: {
    status: 'active',
  },
};

const createPostMutationParams = {
  serviceId: 'post/create',
  invalidateOnSuccess: [{
    serviceId: 'post',
  }],
};

const SandboxPage = ({ someServersideData }) => {
  const currentUser = useBranch('currentUser');
  const isFetchPageDataStateSetTest = useBranch('isFetchPageDataStateSetTest');

  const dispatch = useDispatch();
  const getPostsQuery = useServiceQuery(getPostsQueryParams);
  const createPostMutation = useServiceMutation(createPostMutationParams);

  const navigate = useNavigate();

  const onTestDispatch = () => {
    dispatch(({ apiClient, state }, payload) => {
      console.log('PAYLOAD IS ', payload);
      console.log('API CLIENT IS', apiClient);
      console.log('STATE IS', state.get());
    }, {
      somePayload: 1,
    });
  };

  logger.info('Rendering SandboxPage.jsx');

  console.log('INITIAL getPostsQuery DATA IS', getPostsQuery.data);
  console.log('INITIAL currentUser', currentUser);
  console.log('INITIAL isFetchPageDataStateSetTest', isFetchPageDataStateSetTest);

  debug({ someServersideData });

  return (
    <div>
      <h1 className="text-3xl">
        Sandbox Page
      </h1>

      {/*<h1 styleName="testing">Testing styleName (should be red)...</h1>*/}

      {getPostsQuery.data && (
        <>
          <h3  className="text-2xl">Posts</h3>
          {getPostsQuery.data.map((post) => (
            <Card key={post.id}>
              <h4>{post.title}</h4>
              <p>{post.content || ''}</p>
            </Card>
          ))}
        </>
      )}

      {createPostMutation.data &&
        <p>NEW POST IS {JSON.stringify(createPostMutation.data, null, 2)}</p>
      }

      <p>Hello! Thanks for visiting.</p>
      <p>Serverside data: {someServersideData?.id || 'Loading...'}</p>
      <p>Your user roles: {currentUser.roles}</p>

      <p>
        You are logged in as: {hasRoleAnonymous(currentUser.roles)
          ? '--'
          : `${currentUser.firstName} (id: ${currentUser.id})`}
      </p>

      {!hasRoleAnonymous(currentUser.roles) &&
        <Link to="/logout">Log out</Link>
      }

      {hasRoleAnonymous(currentUser.roles) &&
        <>
          <Link to="/login">Log In</Link>

          <button onClick={() => navigate('/login')}>
            Redirect to Login
          </button>
        </>
      }

      <div>
        <Button
          onClick={() => createPostMutation.mutate({
            title: 'My new post',
            content: 'This is a new post',
          })}
        >
          Create Post
        </Button>

        {createPostMutation.error && (
          <pre>{createPostMutation.error.stack}</pre>
        )}

        <Button onClick={onTestDispatch}>
          Test dispatch
        </Button>

        <h3  className="text-2xl">Users</h3>
        <Link to="/user/1">User 1</Link>
        <Link to="/user/51231">User NonExistant</Link>
        <Link to="/t1e1e12">Link NonExistant</Link>
      </div>
    </div>
  );
};

SandboxPage.getMetadata = ({ state, params }) => {
  const currentUser = state.get(['currentUser']);

  return {
    pageTitle: `CurrentUser Is: ${currentUser.firstName} | Param: ${JSON.stringify(params)}`,
  };
};

SandboxPage.fetchPageData = async ({ apiClient, prefetchQuery, store, params }) => {
  console.log('CALLING fetchPageData');
  console.log('STATE IS', store);
  console.log('PARAMS ARE', params);

  const prefetchQueryData = await prefetchQuery(getPostsQueryParams);
  console.log('prefetchQuery DATA IS', prefetchQueryData);

  store.set(['isFetchPageDataStateSetTest'], true);

  console.log('MANUALLY CALLING health SERVICE');
  // const apiClientGetData = await apiClient.get('admin/health');
  const apiClientPostData = await apiClient.post('admin/health');

  console.log({
    // apiClientGetData,
    apiClientPostData,
  });

  // await sleepAsync(process.browser ? 3000 : 0);
  console.log('Sleeeeeping 300ms');
  await sleepAsync(300);

  // Returns a 404 code.
  //
  // return new Response('', {
  //   status: 404,
  // });

  // return redirect('/login');

  // await dispatch(({ state }) => { state.set(['anew'], true); });

  // const data = await dispatch(requestApi, {
  //   action: API_ACTION_VERIFY_PHONE_SMS_CODE_REQUESTED,
  //   payload: {
  //     true: true,
  //   },
  //   // cache: true,
  // });

  // Example of a redirection.
  // await dispatch(({ navigate }) => navigate('/login'));

  // Example of loading data
  // Mounts automatically to params?
  // dispatch(UserActions.loadById, { id: params.id });

  // fetchPageData redirections

  console.log('WAKE UP!');
  return {
    someServersideData: {
      id: 1,
    },
  };
};

SandboxPage.propTypes = {
  someServersideData: PropTypes.object,
};

export default SandboxPage;
