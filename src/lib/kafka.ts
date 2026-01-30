import { Kafka, type Producer } from "kafkajs";

// 1: Initialize the client

const kafka = new Kafka({
  clientId: "vistagram-app",
  brokers: ["localhost:9092"],
});

// 2: Export Producer (to send data) and consumer (to read data)

export const producer: Producer = kafka.producer();
// export const consumer = kafka.consumer({ groupId: "vistagram-group" });

export const connectKafka = async () => {
  try {
    await producer.connect();
    console.log("Kafka producer ready!");
  } catch (error) {
    console.log("kafka connection error ", error);
  }
};

// Helper to send events

export const sendEvent = async (topic: string, data: object) => {
  try {
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(data) }],
    });
  } catch (error) {
    console.log(`Failed to send to ${topic}`, error);
  }
};

export { kafka };
