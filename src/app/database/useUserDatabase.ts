import { useSQLiteContext } from "expo-sqlite";

export type UserDatabase = {
    id: number;
    name: string;
    phone: string;
    profile_image: string | null;
    user_type: boolean;
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
            const query = "SELECT * FROM users WHERE email = ? AND password = ? AND active = 1";

            const response = await database.getFirstAsync<UserDatabase>(query, [email, password]);

            return response;
        } catch (error) {
            throw error;
        }
    }

    async function update(data: Pick<UserDatabase, 'id'> & Partial<Pick<UserDatabase, 'phone' | 'profile_image'>>) {
        if (!data.id) {
            throw new Error('ID is required for update');
        }

        const statement = await database.prepareAsync(
            'UPDATE users SET phone = ?, profile_image = ? WHERE id = ?'
        );

        try {
            const result = await statement.executeAsync([
                data.phone ?? null,
                data.profile_image ?? null,
                data.id
            ]);

            return result;
        } catch (error) {
            throw error;
        } finally {
            await statement.finalizeAsync();
        }
    }
        
    return {
        create,
        login,
        update
    };
}

export default useUserDatabase;