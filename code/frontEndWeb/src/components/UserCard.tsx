import React from "react";
import { User } from "@/context/UserContext";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Ban, Trash2, Unlock, User as UserIcon, Car } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardFooter,
  CardHeader 
} from "@/components/ui/card";
import { apiClient } from "@/lib/api";

// Add function to properly handle image URLs
const getImageUrl = (imgUrl: string | undefined): string | undefined => {
  if (!imgUrl) return undefined;
  
  // If it's already an absolute URL, return as is
  if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) {
    return imgUrl;
  }
  
  // If it's a relative path, prepend the API base URL
  return `${apiClient.defaults.baseURL}${imgUrl}`;
};

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
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      return '—';
    }
  };

  // Check if user is a motorista
  const isMotorista = user.perfilMotorista !== undefined && user.perfilMotorista !== null;
  
  // Process image URL
  const imageUrl = getImageUrl(user.imgUrl);

  return (
    <Card className="w-full h-full flex flex-col glass-card overflow-hidden hover:shadow-md transition-all border border-gray-200">
      <CardHeader className="p-4 flex flex-row items-center space-x-4 pb-2 min-h-[80px]">
        {/* User Image or Icon with fixed dimensions */}
        <div className="relative flex-shrink-0 w-12 h-12">
          {imageUrl ? (
            <div className="h-12 w-12 rounded-full bg-carona-100 overflow-hidden flex items-center justify-center border-2 border-white shadow-sm">
              <img 
                src={imageUrl} 
                alt={user.nome} 
                className="h-full w-full object-cover"
                loading="lazy"
                onError={(e) => {
                  // If image fails to load, show placeholder icon instead
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
                    parent.classList.add('flex', 'items-center', 'justify-center');
                  }
                }}
              />
            </div>
          ) : (
            <div className="h-12 w-12 rounded-full bg-carona-100 flex items-center justify-center text-carona-700 border-2 border-white shadow-sm">
              <UserIcon className="h-6 w-6" />
            </div>
          )}
          {isMotorista && (
            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-carona-600 flex items-center justify-center text-white border border-white">
              <Car className="h-3 w-3" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="font-medium text-lg truncate">{user.nome}</div>
          <div className="text-sm text-gray-500 truncate">{user.email}</div>
        </div>
        <div className="flex-shrink-0">
          {getStatusBadge(user.status)}
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-2 flex-1 min-h-[100px]">
        <div className="text-sm text-gray-600 space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-500 whitespace-nowrap mr-2">Data de Nascimento:</span>
            <span className="font-medium text-right">{formatBirthDate(user.dataDeNascimento)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 whitespace-nowrap mr-2">Matrícula:</span>
            <span className="font-medium text-right">{user.matricula || '—'}</span>
          </div>
          {user.curso && (
            <div className="flex justify-between">
              <span className="text-gray-500 whitespace-nowrap mr-2">Curso:</span>
              <span className="font-medium truncate ml-2 text-right max-w-[60%]" title={user.curso}>{user.curso}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-500 whitespace-nowrap mr-2">Avaliação:</span>
            <span className="font-medium flex items-center justify-end">
              {user.avaliacaoMedia !== undefined ? (
                <>
                  {user.avaliacaoMedia.toFixed(1)}
                  <svg className="w-4 h-4 text-yellow-400 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </>
              ) : '—'}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 grid grid-cols-2 gap-2 mt-auto border-t border-gray-100">
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
              className="w-full col-span-2 mt-1"
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
              Bloquear
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
