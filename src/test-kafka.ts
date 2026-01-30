import { producer, connectKafka } from "./lib/kafka.js";

const run = async () => {
  await connectKafka();

  const event = {
    userId: "user_123",
    postId: "post_555",
    action: "LIKE",
    timestamp: new Date().toISOString(),
  };

  console.log("Sending event...", event);

  await producer.send({
    topic: "vistagram-events",
    messages: [{ value: JSON.stringify(event) }],
  });

  console.log("🚀 Event Sent successfully!");
  process.exit(0);
};

run().catch(console.error);
