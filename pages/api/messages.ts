import { NextApiRequest, NextApiResponse } from 'next';

const messages = [
  { id: 1, user: 'Alice', content: 'Hey everyone!' },
  { id: 2, user: 'Bob', content: 'Hi Alice, how are you?' },
  { id: 3, user: 'Charlie', content: 'Hello there!' },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.status(200).json(messages);
  } else if (req.method === 'POST') {
    const newMessage = req.body;
    messages.push(newMessage);
    res.status(201).json(newMessage);
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
