import makeDispatchFn from '#white-room/client/core/makeDispatchFn.js';

const initListeners = ({ listeners, apiClient, store } = {}) => {
  console.log('store');
  console.log(store);
  const dispatch = makeDispatchFn({ state: store, apiClient });

  for (const { serviceId, action, event } of Object.keys(listeners)) {
    console.log(`Attaching event listener: ${serviceId} ${event}`)
    store.on(`apiClient:${event}:${serviceId}`, async ({ requestPayload } = {}) => {
      dispatch(action, requestPayload);
    });
  }
}

export default initListeners;
