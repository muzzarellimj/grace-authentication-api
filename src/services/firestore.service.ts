import {
    DocumentData,
    WhereFilterOp,
    collection,
    deleteDoc,
    doc,
    getDocs,
    getFirestore,
    query,
    setDoc,
    updateDoc,
    where,
} from 'firebase/firestore';

export const enum FirestorePath {
    SESSION = 'sessions',
    USER = 'users',
}

export class FirestoreService {
    static async findOne(
        path: FirestorePath,
        key: string,
        operator: WhereFilterOp,
        value: any
    ): Promise<DocumentData | null> {
        const queryStatement = query(
            collection(getFirestore(), path),
            where(key, operator, value)
        );
        const snapshot = await getDocs(queryStatement);

        if (snapshot.empty) {
            return null;
        }

        return snapshot.docs[0].data();
    }

    static async storeOne(path: FirestorePath, document: any): Promise<void> {
        const documentReference = doc(collection(getFirestore(), path));

        document.id = documentReference.id;
        document.createdAt = Date.now();

        await setDoc(documentReference, document);
    }

    static async updateOne(
        path: FirestorePath,
        key: string,
        operator: WhereFilterOp,
        value: any,
        data: any
    ): Promise<boolean> {
        const queryStatement = query(
            collection(getFirestore(), path),
            where(key, operator, value)
        );
        const snapshot = await getDocs(queryStatement);

        if (snapshot.empty) {
            return false;
        }

        const documentReference = snapshot.docs[0].ref;

        await updateDoc(documentReference, data);

        return true;
    }

    static async deleteOne(
        path: FirestorePath,
        key: string,
        operator: WhereFilterOp,
        value: any
    ) {
        const queryStatement = query(
            collection(getFirestore(), path),
            where(key, operator, value)
        );
        const snapshot = await getDocs(queryStatement);

        if (!snapshot.empty) {
            await deleteDoc(doc(getFirestore(), path, snapshot.docs[0].id));
        }
    }
}
