const websocket = new WebSocket("ws://websocket-url");

self.onconnect = function (event) {
  const port = event.ports[0];

  websocket.onopen = () => console.log("WebSocket connected.");

  websocket.onmessage = (message) => {
    port.postMessage(message.data);
  };

  port.onmessage = (event) => {
    if (websocket.readyState === WebSocket.OPEN) {
      websocket.send(JSON.stringify(event.data));
    }
  };
};
