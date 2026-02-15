declare module '@/components/features/user-management-row' {
  export interface UserManagementRowProps {
    user: {
      id: string;
      email: string;
      full_name: string | null;
      role: 'user' | 'admin';
      credits: number;
      created_at: string;
    };
  }
  
  export function UserManagementRow(props: UserManagementRowProps): JSX.Element;
}
