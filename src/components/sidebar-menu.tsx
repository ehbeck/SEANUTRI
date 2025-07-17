"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  CalendarDays, 
  History, 
  Database, 
  BookOpen, 
  Building, 
  Users, 
  UserCheck, 
  FileText, 
  Settings 
} from "lucide-react"
import { 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton 
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface SidebarMenuComponentProps {
  user: any
  hasPermission?: (permission: string) => boolean
}

export function SidebarMenuComponent({ user, hasPermission }: SidebarMenuComponentProps) {
  const pathname = usePathname()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Link href="/dashboard" passHref>
          <SidebarMenuButton isActive={pathname === '/dashboard'} tooltip="Dashboard">
            <LayoutDashboard />
            Dashboard
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
      
      {user?.profile === 'Administrador' && (
        <SidebarMenuItem>
          <Link href="/agendamentos" passHref>
            <SidebarMenuButton isActive={pathname.startsWith('/agendamentos')} tooltip="Agendamentos">
              <CalendarDays />
              Agendamentos
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      )}
      
      <SidebarMenuItem>
        <Link href="/historico" passHref>
          <SidebarMenuButton isActive={pathname.startsWith('/historico')} tooltip="Histórico">
            <History />
            Histórico
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
      
      {user?.profile === 'Administrador' && (
        <>
          <SidebarMenuItem>
            <Collapsible>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton isSubmenu>
                  <Database />
                  Banco de Dados
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent className="ml-4">
                <SidebarMenu>
                  <SidebarMenuItem>
                    <Link href="/cursos" passHref>
                      <SidebarMenuButton isActive={pathname.startsWith('/cursos')} tooltip="Cursos">
                        <BookOpen/> Cursos
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/empresas" passHref>
                      <SidebarMenuButton isActive={pathname.startsWith('/empresas')} tooltip="Empresas">
                        <Building/> Empresas
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/usuarios" passHref>
                      <SidebarMenuButton isActive={pathname.startsWith('/usuarios')} tooltip="Usuários">
                        <Users/> Usuários
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/instrutores" passHref>
                      <SidebarMenuButton isActive={pathname.startsWith('/instrutores')} tooltip="Instrutores">
                        <UserCheck/> Instrutores
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                </SidebarMenu>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/relatorios" passHref>
              <SidebarMenuButton isActive={pathname.startsWith('/relatorios')} tooltip="Relatórios">
                <FileText />
                Relatórios
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/configuracoes" passHref>
              <SidebarMenuButton isActive={pathname.startsWith('/configuracoes')} tooltip="Configurações">
                <Settings />
                Configurações
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </>
      )}
      
      {user?.profile !== 'Administrador' && (
        <SidebarMenuItem>
          <Link href="/cursos" passHref>
            <SidebarMenuButton isActive={pathname.startsWith('/cursos')} tooltip="Cursos">
              <BookOpen/> Cursos
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      )}
    </SidebarMenu>
  )
} 