import { NextApiRequest, NextApiResponse } from 'next';

const channels = [
  { id: 1, name: 'general' },
  { id: 2, name: 'random' },
  { id: 3, name: 'project-a' },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.status(200).json(channels);
  } else if (req.method === 'POST') {
    const newChannel = req.body;
    channels.push(newChannel);
    res.status(201).json(newChannel);
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}