import { useSQLiteContext } from "expo-sqlite";

export type FileDatabase = {
    id: number;
    title: string;
    file_path: string;
    created_by: number;
    responsible_by: number | null;
    status: string;
    text: string | null;
    created_at: string;
    updated_at: string;
}

function useFileDatabase() {
    const database = useSQLiteContext();

    async function create(data: Omit<FileDatabase, 'id' | 'created_at' | 'updated_at' | 'responsible_by'>) {
        const statement = await database.prepareAsync(
            `INSERT INTO files (
                title, 
                file_path, 
                created_by,
                status, 
                text
            ) VALUES (
                $title, 
                $file_path, 
                $created_by,
                $status, 
                $text
            )`
        );

        try {
            const result = await statement.executeAsync({
                $title: data.title,
                $file_path: data.file_path,
                $created_by: data.created_by,
                $status: data.status,
                $text: data.text,
            });

            const insertedRowId = result.lastInsertRowId.toString();

            return { file: { ...data, id: parseInt(insertedRowId) } };
        } catch (error) {
            throw error;
        } finally {
            await statement.finalizeAsync();
        }
    }

    async function update(data: Pick<FileDatabase, 'id'> & Partial<Omit<FileDatabase, 'id' | 'created_at' | 'updated_at'>>) {
        if (!data.id) {
            throw new Error('ID is required for update');
        }

        const { id, ...fields } = data;
        const keys = Object.keys(fields).filter((key) => fields[key as keyof typeof fields] !== undefined);

        if (keys.length === 0) {
            throw new Error('No valid fields to update');
        }

        const setClause = keys.map((key) => `${key} = $${key}`).join(', ');
        const params = keys.reduce((acc, key) => ({
            ...acc,
            [`$${key}`]: fields[key as keyof typeof fields]
        }), { $id: id });

        const sql = `UPDATE files SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $id`;

        const statement = await database.prepareAsync(sql);

        try {
            const result = await statement.executeAsync(params);
            return result;
        } catch (error) {
            throw error;
        } finally {
            await statement.finalizeAsync();
        }
    }

    async function getFileById(id: number) {
        const query = `
            SELECT 
                f.*,
                c.name as creator_name,
                r.name as responsible_name
            FROM files f
            LEFT JOIN users c ON f.created_by = c.id
            LEFT JOIN users r ON f.responsible_by = r.id
            WHERE f.id = ?
        `;

        const response = await database.getFirstAsync<FileDatabase & { creator_name?: string; responsible_name?: string }>(query, [id]);
        return response;
    }

    async function list() {
        const query = `
            SELECT 
                f.*,
                c.name as creator_name,
                r.name as responsible_name
            FROM files f
            LEFT JOIN users c ON f.created_by = c.id
            LEFT JOIN users r ON f.responsible_by = r.id
            ORDER BY f.created_at DESC
        `;

        const response = await database.getAllAsync<FileDatabase & { creator_name?: string; responsible_name?: string }>(query);
        return response;
    }

    async function deleteFile(id: number) {
        const statement = await database.prepareAsync('DELETE FROM files WHERE id = ?');

        try {
            const result = await statement.executeAsync([id]);
            return result;
        } catch (error) {
            throw error;
        } finally {
            await statement.finalizeAsync();
        }
    }

    async function approveFile(id: number) {
        const statement = await database.prepareAsync('UPDATE files SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
        await statement.executeAsync(['completed', id]);
        await statement.finalizeAsync();
    }

    async function rejectFile(id: number) {
        const statement = await database.prepareAsync('UPDATE files SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
        await statement.executeAsync(['rejected', id]);
        await statement.finalizeAsync();
    }

    return {
        create,
        update,
        getFileById,
        list,
        deleteFile,
        approveFile,
        rejectFile
    };
}

export default useFileDatabase; 