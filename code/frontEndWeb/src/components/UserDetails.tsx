import React, { useState, useEffect } from "react";
import { User, useUsers } from "@/context/UserContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { User as UserIcon, Car, CreditCard, MessageCircle } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState("general");

  // Reset to general tab when opening a new user
  useEffect(() => {
    if (isOpen && user) {
      setActiveTab("general");
    }
  }, [isOpen, user?.id]);

  useEffect(() => {
    if (user && isOpen) {
      setEditedUser({
        nome: user.nome,
        email: user.email,
        dataDeNascimento: user.dataDeNascimento,
        matricula: user.matricula,
        avaliacaoMedia: user.avaliacaoMedia,
        curso: user.curso,
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

  const getUserTypeBadge = (type: string) => {
    switch (type) {
      case "ADMINISTRADOR":
        return <Badge className="bg-purple-100 text-purple-800">Administrador</Badge>;
      case "ESTUDANTE":
        return <Badge className="bg-blue-100 text-blue-800">Estudante</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{type}</Badge>;
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
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      return dateString;
    }
  };

  const isMotorista = user.perfilMotorista !== undefined && user.perfilMotorista !== null;

  // Process image URL
  const imageUrl = getImageUrl(user.imgUrl);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-white z-10 pb-2">
          <DialogTitle>Detalhes do Usuário</DialogTitle>
          <DialogDescription>
            Informações detalhadas do usuário
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-4">
          <div className="h-24 w-24 mb-2 rounded-full bg-carona-100 flex items-center justify-center text-carona-700 border-4 border-white shadow-md overflow-hidden">
            {imageUrl ? (
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
                    parent.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-10 w-10"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
                    parent.classList.add('flex', 'items-center', 'justify-center');
                  }
                }}
              />
            ) : (
              <UserIcon className="h-10 w-10" />
            )}
          </div>
          
          <div className="text-center mb-4">
            <h2 className="text-xl font-semibold">{user.nome}</h2>
            <p className="text-gray-500">{user.email}</p>
            <div className="mt-2 flex gap-2 justify-center flex-wrap">
              {getStatusBadge(user.status)}
              {getUserTypeBadge(user.tipoUsuario || 'ESTUDANTE')}
              {isMotorista && (
                <Badge className="bg-carona-100 text-carona-800">Motorista</Badge>
              )}
            </div>
          </div>
          
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
                  disabled
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
                <Label htmlFor="curso">Curso</Label>
                <Input
                  id="curso"
                  name="curso"
                  value={editedUser.curso || ""}
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
                  disabled
                />
              </div>
            </div>
          ) : (
            <div className="w-full">
              <Tabs 
                defaultValue="general" 
                className="w-full" 
                onValueChange={setActiveTab} 
                value={activeTab}
              >
                <TabsList className="grid grid-cols-2 w-full mb-2">
                  <TabsTrigger value="general">Dados Gerais</TabsTrigger>
                  {isMotorista && <TabsTrigger value="driver">Perfil Motorista</TabsTrigger>}
                </TabsList>
                <TabsContent value="general" className="mt-2 data-[state=active]:block data-[state=inactive]:hidden">
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                    <div className="text-gray-500 font-medium">Nome:</div>
                    <div className="break-words">{user.nome}</div>
                    
                    <div className="text-gray-500 font-medium">Email:</div>
                    <div className="break-words">{user.email}</div>
                    
                    <div className="text-gray-500 font-medium">Data de Nascimento:</div>
                    <div>{formatDisplayDate(user.dataDeNascimento)}</div>
                    
                    <div className="text-gray-500 font-medium">Matrícula:</div>
                    <div>{user.matricula || '—'}</div>
                    
                    <div className="text-gray-500 font-medium">Curso:</div>
                    <div className="break-words">{user.curso || '—'}</div>
                    
                    <div className="text-gray-500 font-medium">Avaliação Média:</div>
                    <div className="flex items-center">
                      {user.avaliacaoMedia ? (
                        <>
                          <span className="mr-1">{user.avaliacaoMedia.toFixed(1)}</span>
                          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </>
                      ) : '—'}
                    </div>
                    
                    <div className="text-gray-500 font-medium">Status:</div>
                    <div className="capitalize">{user.status.toLowerCase()}</div>
                    
                    <div className="text-gray-500 font-medium">Tipo de Usuário:</div>
                    <div className="capitalize">{user.tipoUsuario ? user.tipoUsuario.toLowerCase() : 'estudante'}</div>
                  </div>
                </TabsContent>
                
                {isMotorista && (
                  <TabsContent value="driver" className="mt-2 data-[state=active]:block data-[state=inactive]:hidden">
                    <div className="space-y-4">
                      <div className="p-4 rounded-md border border-carona-200 bg-carona-50">
                        <div className="flex items-center mb-3">
                          <CreditCard className="h-5 w-5 mr-2 text-carona-700" />
                          <h3 className="font-medium text-carona-800">Informações de Habilitação</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-gray-500 font-medium">CNH:</div>
                          <div>{user.perfilMotorista?.cnh || '—'}</div>
                        </div>
                      </div>
                      
                      {user.perfilMotorista?.carro && (
                        <div className="p-4 rounded-md border border-carona-200 bg-carona-50">
                          <div className="flex items-center mb-3">
                            <Car className="h-5 w-5 mr-2 text-carona-700" />
                            <h3 className="font-medium text-carona-800">Informações do Veículo</h3>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-gray-500 font-medium">Modelo:</div>
                            <div className="break-words">{user.perfilMotorista.carro.modelo || '—'}</div>
                            
                            <div className="text-gray-500 font-medium">Placa:</div>
                            <div>{user.perfilMotorista.carro.placa || '—'}</div>
                            
                            <div className="text-gray-500 font-medium">Cor:</div>
                            <div>{user.perfilMotorista.carro.cor || '—'}</div>
                            
                            <div className="text-gray-500 font-medium">Ano:</div>
                            <div>{user.perfilMotorista.carro.ano || '—'}</div>
                          </div>
                        </div>
                      )}
                      
                      <div className="p-4 rounded-md border border-carona-200 bg-carona-50">
                        <div className="flex items-center mb-3">
                          <MessageCircle className="h-5 w-5 mr-2 text-carona-700" />
                          <h3 className="font-medium text-carona-800">Contato</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-gray-500 font-medium">WhatsApp:</div>
                          <div>{user.perfilMotorista?.whatsapp || '—'}</div>
                          
                          <div className="text-gray-500 font-medium">Mostrar WhatsApp:</div>
                          <div>
                            {user.perfilMotorista?.mostrarWhatsapp ? 'Sim' : 'Não'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex sm:justify-between mt-4 pt-2 border-t border-gray-100">
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
