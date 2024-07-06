import createDebug from 'debug';
import typeCheck from '#white-room/util/typeCheck.js';

const debug = createDebug('stateMachine');

const statusUpdateHookManager = (() => {
  let _stateUpdateHooks = [];

  return {
    registerStatusUpdateHooks(newStatusUpdateHooks) {
      for (const hook of newStatusUpdateHooks) {
        typeCheck('table::NonEmptyString', hook.table);
        typeCheck('handler::Function|AsyncFunction', hook.handler);
        typeCheck('fromStatus::Maybe NonEmptyString|Array', hook.fromStatus);
        typeCheck('toStatus::NonEmptyString|NonEmptyArray', hook.toStatus);
      }
      _stateUpdateHooks = [..._stateUpdateHooks, ...newStatusUpdateHooks];
    },
    async processStatusUpdate({ table, id, fromStatus, toStatus }) {
      typeCheck('table::NonEmptyString', table);
      typeCheck('id::PositiveNumber', id);
      typeCheck('fromStatus::Maybe NonEmptyString', fromStatus);
      typeCheck('toStatus::NonEmptyString', toStatus);

      debug(`Processing status update hooks: [${table}] ${id} ${fromStatus}->${toStatus}`);

      const hooks = _stateUpdateHooks.filter((hook) => {
        const hookFromArr = hook.fromStatus && !Array.isArray(hook.fromStatus)
          ? [hook.fromStatus]
          : null;
        const hookToArr = !Array.isArray(hook.toStatus)
          ? [hook.toStatus]
          : hook.toStatus;
        return (
          (!hookFromArr || hookFromArr.includes(fromStatus))
          && (hookToArr.includes(toStatus))
          && (hook.table === table)
        );
      });

      for (const hook of hooks) {
        try {
          await hook.handler(id);
        }
        catch (hookError) {
          debug(`Error in hook handler: ${hookError}`);
        }
      }
    },
  };
})();

export const {
  registerStatusUpdateHooks,
  processStatusUpdate,
} = statusUpdateHookManager;