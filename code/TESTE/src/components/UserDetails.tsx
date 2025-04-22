
import React, { useState } from "react";
import { User, useUsers } from "@/context/UserContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { User as UserIcon } from "lucide-react";

type UserDetailsProps = {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  mode?: "view" | "edit";
};

const UserDetails: React.FC<UserDetailsProps> = ({ 
  user, 
  isOpen, 
  onClose,
  mode = "view"
}) => {
  const { updateUser } = useUsers();
  const [isEditing, setIsEditing] = useState(mode === "edit");
  const [editedUser, setEditedUser] = useState<Partial<User>>({});

  React.useEffect(() => {
    if (user && isOpen) {
      setEditedUser({
        nome: user.nome,
        email: user.email,
        dataDeNascimento: user.dataDeNascimento,
        matricula: user.matricula,
        avaliacaoMedia: user.avaliacaoMedia,
      });
    }
  }, [user, isOpen]);

  if (!user) return null;

  const getStatusBadge = (status: User["status"]) => {
    switch (status) {
      case "PENDENTE":
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case "APROVADO":
        return <Badge className="bg-green-100 text-green-800">Aprovado</Badge>;
      case "REJEITADO":
        return <Badge className="bg-red-100 text-red-800">Rejeitado</Badge>;
      case "CANCELADO":
        return <Badge className="bg-gray-100 text-gray-800">Cancelado</Badge>;
      case "FINALIZADO":
        return <Badge className="bg-blue-100 text-blue-800">Finalizado</Badge>;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({ ...prev, [name]: value }));
  };

  // Handle numeric input specifically for the rating
  const handleRatingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 5) {
      setEditedUser(prev => ({ ...prev, avaliacaoMedia: value }));
    }
  };

  const handleSave = async () => {
    try {
      await updateUser(user.id, editedUser);
      setIsEditing(false);
      toast.success("Informações atualizadas com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar informações");
    }
  };

  // Format date from yyyy-MM-dd to dd/MM/yyyy for display
  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md animate-scale-in">
        <DialogHeader>
          <DialogTitle>Detalhes do Usuário</DialogTitle>
          <DialogDescription>
            Informações detalhadas do usuário
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-4">
          <div className="h-24 w-24 mb-4 rounded-full bg-carona-100 flex items-center justify-center text-carona-700 border-4 border-white shadow-md">
            <UserIcon className="h-10 w-10" />
          </div>
          
          <div className="text-center mb-2">
            {isEditing ? (
              <div className="space-y-3 w-full">
                <div>
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    name="nome"
                    value={editedUser.nome || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    value={editedUser.email || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="dataDeNascimento">Data de Nascimento</Label>
                  <Input
                    id="dataDeNascimento"
                    name="dataDeNascimento"
                    type="date"
                    value={editedUser.dataDeNascimento || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="matricula">Matrícula</Label>
                  <Input
                    id="matricula"
                    name="matricula"
                    value={editedUser.matricula || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="avaliacaoMedia">Avaliação Média</Label>
                  <Input
                    id="avaliacaoMedia"
                    name="avaliacaoMedia"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={editedUser.avaliacaoMedia || 0}
                    onChange={handleRatingChange}
                  />
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold">{user.nome}</h2>
                <p className="text-gray-500">{user.email}</p>
                <div className="mt-2">
                  {getStatusBadge(user.status)}
                </div>
                
                <div className="mt-6 text-left space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-500">Data de Nascimento:</div>
                    <div>{formatDisplayDate(user.dataDeNascimento)}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-500">Matrícula:</div>
                    <div>{user.matricula}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-500">Avaliação Média:</div>
                    <div>{user.avaliacaoMedia.toFixed(1)}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-500">Status:</div>
                    <div className="capitalize">{user.status.toLowerCase()}</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        
        <DialogFooter className="flex sm:justify-between">
          {isEditing ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                Cancelar
              </Button>
              <Button type="button" onClick={handleSave}>
                Salvar Alterações
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Fechar
              </Button>
              <Button type="button" onClick={() => setIsEditing(true)}>
                Editar Informações
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetails;
