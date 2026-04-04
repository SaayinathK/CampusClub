const clients = new Set();

function sendEvent(response, event, payload) {
  response.write(`event: ${event}\n`);
  response.write(`data: ${JSON.stringify(payload)}\n\n`);
}

export function subscribeToNotificationStream({ userId, role, response }) {
  const client = {
    userId: String(userId),
    role,
    response
  };

  clients.add(client);

  sendEvent(response, 'connected', {
    userId: client.userId,
    role
  });

  const heartbeat = setInterval(() => {
    sendEvent(response, 'ping', { ts: Date.now() });
  }, 25000);

  return () => {
    clearInterval(heartbeat);
    clients.delete(client);
  };
}

export function publishToUser(userId, event, payload) {
  const normalizedUserId = String(userId);

  clients.forEach((client) => {
    if (client.userId === normalizedUserId) {
      sendEvent(client.response, event, payload);
    }
  });
}

export function publishToUsers(userIds, event, payloadFactory) {
  [...new Set(userIds.map((userId) => String(userId)))].forEach((userId) => {
    const payload =
      typeof payloadFactory === 'function' ? payloadFactory(userId) : payloadFactory;

    if (payload) {
      publishToUser(userId, event, payload);
    }
  });
}

export function publishToRole(role, event, payload) {
  clients.forEach((client) => {
    if (client.role === role) {
      sendEvent(client.response, event, payload);
    }
  });
}
