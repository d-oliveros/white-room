const { host } = __config.server;

const task = {

  // Defines the mandrill template and default mail values
  send: {
    templateName: 'dummy-email-template',
    fromName: 'Boilerplate App'
  },

  // Formats the variables to be used in mandrill templates
  getVars(user) {
    return {
      userName: user.name,
      siteUrl: host
    };
  }
};

export default task;
