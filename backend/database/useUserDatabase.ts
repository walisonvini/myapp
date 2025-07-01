import { useSQLiteContext } from "expo-sqlite";

export type UserDatabase = {
    id: number;
    name: string;
    phone: string;
    profile_image: string | null;
    user_type: number;
    email: string;
    password: string;
    change_password: boolean;
    active: boolean;
}

function useUserDatabase() {
    const database = useSQLiteContext();        

    async function create(data: Omit<UserDatabase, 'id'>) {
        const statement = await database.prepareAsync(
            'INSERT INTO users (name, phone, profile_image, user_type, email, password, change_password, active) VALUES ($name, $phone, $profile_image, $user_type, $email, $password, $change_password, $active)'
        );

        try {
           const result = await statement.executeAsync({
            $name: data.name,
            $phone: data.phone,
            $profile_image: data.profile_image,
            $user_type: data.user_type,
            $email: data.email,
            $password: data.password,
            $change_password: data.change_password,
            $active: data.active,
           });

           const insertedRowId = result.lastInsertRowId.toString();

           return { user: {...data, id: parseInt(insertedRowId)}}
        } catch (error) {
            throw error;
        } finally {
            await statement.finalizeAsync();
        }
    }

    async function login(email: string, password: string) {
        try {
            const query = "SELECT * FROM users WHERE email = ? AND password = ?";

            const response = await database.getFirstAsync<UserDatabase>(query, [email, password]);

            if (!response) {
                throw new Error('Email ou senha incorretos');
            }

            if (!response.active) {
                throw new Error('Usuário não está ativo');
            }

            return response;
        } catch (error) {
            throw error;
        }
    }

    async function update(data: Pick<UserDatabase, 'id'> & Partial<Omit<UserDatabase, 'id'>>) {
        if (!data.id) {
            throw new Error('ID is required for update');
        }

        // Remove o id do objeto de dados para montar o update
        const { id, ...fields } = data;

        // Filtra apenas os campos definidos (não undefined)
        const keys = Object.keys(fields).filter((key) => fields[key as keyof typeof fields] !== undefined);

        if (keys.length === 0) {
            throw new Error('No valid fields to update');
        }

        // Cria o SQL dinâmico com base nos campos fornecidos
        const setClause = keys.map((key) => `${key} = $${key}`).join(', ');
        const params = keys.reduce((acc, key) => ({
            ...acc,
            [`$${key}`]: fields[key as keyof typeof fields]
        }), { $id: id });

        const sql = `UPDATE users SET ${setClause} WHERE id = $id`;

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

    async function getUserById(id: number) {
        const query = "SELECT * FROM users WHERE id = ?";

        const response = await database.getFirstAsync<UserDatabase>(query, [id]);

        return response;
    }

    async function list() {
        const query = "SELECT * FROM users";

        const response = await database.getAllAsync<UserDatabase>(query);

        return response;
    }

    return {
        create,
        login,
        update,
        getUserById,
        list
    };
}

export default useUserDatabase;