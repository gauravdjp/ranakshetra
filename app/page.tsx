import { Admin } from '../types';
import { WithId } from 'mongodb';
import clientPromise from '@/lib/mongodb';

export default async function Home() {
  const client = await clientPromise;
  const db = client.db('rks');

  await db.collection<Admin>('admins').insertOne({
    username: 'admin',
    password: 'password',
    role: 'admin',
    createdAt: new Date(),
  });

  const admins: WithId<Admin>[] = await db.collection<Admin>('admins').find({}).toArray();
  return (
    <div>
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      <h1>Admins</h1>
      {admins.map((admin) => (
        <div key={admin._id.toString()}>
          <p>{admin.username}</p>
          <p>{admin.role}</p>
        </div>
      ))}
    </div>
  );
}
