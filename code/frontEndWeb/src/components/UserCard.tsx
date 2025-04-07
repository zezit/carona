
import React from "react";
import { User } from "@/context/UserContext";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Ban, Trash2, Unlock, User as UserIcon } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardFooter,
  CardHeader 
} from "@/components/ui/card";

type UserCardProps = {
  user: User;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onBlock?: (id: string) => void;
  onUnblock?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView: (user: User) => void;
  mode?: "approval" | "management";
};

const UserCard: React.FC<UserCardProps> = ({
  user,
  onApprove,
  onReject,
  onBlock,
  onUnblock,
  onDelete,
  onView,
  mode = "approval"
}) => {
  const getStatusBadge = (status: User["status"]) => {
    switch (status) {
      case "PENDENTE":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pendente</Badge>;
      case "APROVADO":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Aprovado</Badge>;
      case "REJEITADO":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejeitado</Badge>;
      case "CANCELADO":
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Cancelado</Badge>;
      case "FINALIZADO":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Finalizado</Badge>;
      default:
        return null;
    }
  };

  // Format birth date to display as DD/MM/YYYY
  const formatBirthDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader className="p-4 flex flex-row items-center space-x-4 pb-2">
        {/* User Image or Icon */}
        {user.imgUrl ? (
          <img 
            src={user.imgUrl} 
            alt={user.nome} 
            className="h-12 w-12 rounded-full border-2 border-white shadow-sm object-cover" 
          />
        ) : (
          <div className="h-12 w-12 rounded-full bg-carona-100 flex items-center justify-center text-carona-700 border-2 border-white shadow-sm">
            <UserIcon className="h-6 w-6" />
          </div>
        )}
        <div className="flex-1 overflow-hidden">
          <div className="font-medium text-lg truncate">{user.nome}</div>
          <div className="text-sm text-gray-500 truncate">{user.email}</div>
        </div>
        {getStatusBadge(user.status)}
      </CardHeader>
      
      <CardContent className="p-4 pt-2">
        <div className="text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Data de Nascimento:</span>
            <span className="font-medium">{formatBirthDate(user.dataDeNascimento)}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span>Matrícula:</span>
            <span className="font-medium">{user.matricula}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span>Avaliação Média:</span>
            <span className="font-medium">{user.avaliacaoMedia.toFixed(1)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 grid grid-cols-2 gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => onView(user)}
        >
          Detalhes
        </Button>

        {mode === "approval" && user.status === "PENDENTE" ? (
          <>
            <Button 
              variant="default" 
              size="sm" 
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={() => onApprove && onApprove(user.id)}
            >
              <Check className="mr-1 h-4 w-4" />
              Aprovar
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              className="w-full col-span-2"
              onClick={() => onReject && onReject(user.id)}
            >
              <X className="mr-1 h-4 w-4" />
              Rejeitar
            </Button>
          </>
        ) : mode === "management" ? (
          user.status === "CANCELADO" ? (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-green-600 border-green-200 hover:bg-green-50"
              onClick={() => onUnblock && onUnblock(user.id)}
            >
              <Unlock className="mr-1 h-4 w-4" />
              Desbloquear
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => onBlock && onBlock(user.id)}
            >
              <Ban className="mr-1 h-4 w-4" />
              {user.status === "APROVADO" ? "Bloquear" : "Bloquear"}
            </Button>
          )
        ) : null}
        
        {mode === "management" && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-gray-600 hover:text-red-700 hover:bg-red-50 col-span-2 mt-1"
            onClick={() => onDelete && onDelete(user.id)}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Excluir
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default UserCard;
