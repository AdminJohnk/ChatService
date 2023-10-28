const checkConnect = (activeArr) => {
  setInterval(() => {
    console.log('Number of active users: ', activeArr.length);
  }, 5000);
};

export default checkConnect;
