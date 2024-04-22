import { useRouter } from "next/router"
import { kv } from '@vercel/kv';
import { notFound } from "next/navigation";

export default async function Claim({ params }: { params: { hash: `0x${string}` } }) {
    const merkleRoot = await kv.get(params.hash);
    if (!merkleRoot) {
        notFound();
    }

    return <>{merkleRoot}</>
}