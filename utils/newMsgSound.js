const newMsgSound = (senderName) => {
  const previousTitle = document.title;

  const sound = new Audio("/light.mp3");

  sound && sound.play();
  if (senderName) {
    document.title = `New message from ${senderName}`;

    if (document.visibilityState === "visible") {
      setTimeout(() => {
        document.title = previousTitle;
      }, 5000);
    }
  }
};

export default newMsgSound;
