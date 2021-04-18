import { DB } from "./lib"
import * as uuid from "uuid";

interface User {
  firstName: string;
  lastName: string;
}

const db = new DB({ name: "some-test" });

const run = async () => {
  const collections = {
    users: await db.collection<User>("users")
  }

  const u = await collections.users.find({
    selector: {}
  });

  await collections.users.put({
    _id: uuid.v1(),
    firstName: "Ivan",
    lastName: "Vityaev"
  });

  for (const user of u.docs) {
    await collections.users.remove(user);
  }

  console.log("Test passed");
}

run().catch(console.log)
