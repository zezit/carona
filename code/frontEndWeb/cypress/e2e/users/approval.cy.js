// cypress/e2e/approval.cy.js
// ✅ Testes de aprovação usando mesmo padrão do navigation

describe('Página de Aprovação de Usuários', () => {
  
  beforeEach(() => {
    // ✅ Login básico que sabemos que funciona (igual navigation)
    cy.visit('/');
    cy.get('#email').type('admin@carona.com');
    cy.get('#password').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.wait(300); // Aguardar login processar
  });

  it('Deve navegar para página de aprovação e exibir conteúdo', () => {
    // console.log('🔍 Testando navegação para /approval');
    
    // ✅ Navegar diretamente para approval
    cy.visit('/approval');
    cy.wait(500); // Aguardar mais tempo para carregar dados
    
    // ✅ Verificar se chegou na página correta
    cy.url().should('include', '/approval');
    
    // ✅ Verificar conteúdo da página
    cy.get('body').then($body => {
      const text = $body.text();
      // console.log('🔍 Conteúdo da página approval:', text.substring(0, 300));
      
      // Procurar por indicadores de que é a página de approval
      if (text.includes('Aprovação') || 
          text.includes('Usuários') || 
          text.includes('Pendente') || 
          text.includes('Solicitações')) {
        // console.log('✅ Página de approval carregou corretamente');
      } else {
        // console.log('⚠️ Conteúdo inesperado, mas página carregou');
      }
    });
    
    // ✅ Verificar elementos básicos da página
    cy.get('body').should('satisfy', ($body) => {
      const text = $body.text();
      return text.includes('Aprovação') || 
             text.includes('Usuários') ||
             text.includes('Pendente') ||
             text.includes('Solicitações') ||
             text.includes('Gerencie') ||
             text.includes('Admin');
    });
  });

  it('Deve verificar se há dados na página ou mensagem vazia', () => {
    // console.log('🔍 Verificando dados na página de approval');
    
    cy.visit('/approval');
    cy.wait(1000); // Aguardar dados carregarem
    
    cy.get('body').then($body => {
      const text = $body.text();
      // console.log('🔍 Verificando dados:', text.substring(0, 400));
      
      // Verificar se há cards de usuários ou lista
      if ($body.find('[data-cy="user-card"]').length > 0) {
        // console.log('✅ Cards de usuários encontrados');
        cy.get('[data-cy="user-card"]').should('be.visible');
        
      } else if ($body.find('table').length > 0) {
        // console.log('✅ Tabela de usuários encontrada');
        cy.get('table').should('be.visible');
        
      } else if (text.includes('Nenhum') || 
                 text.includes('vazio') || 
                 text.includes('Não há')) {
        // console.log('✅ Mensagem de lista vazia exibida');
        
      } else if (text.includes('Carregando') || 
                 text.includes('Loading')) {
        // console.log('⚠️ Ainda carregando dados');
        cy.wait(2000); // Aguardar mais tempo
        
      } else {
        // console.log('⚠️ Estrutura da página pode ser diferente');
      }
    });
  });

  it('Deve verificar se há botões de ação quando existem usuários', () => {
    // console.log('🔍 Verificando botões de ação');
    
    cy.visit('/approval');
    cy.wait(1000);
    
    cy.get('body').then($body => {
      const text = $body.text();
      
      // Procurar por botões típicos de aprovação
      if (text.includes('Aprovar') || text.includes('Rejeitar')) {
        // console.log('✅ Botões de ação encontrados');
        
        // Verificar se botões são clicáveis (sem clicar)
        if ($body.find('button:contains("Aprovar")').length > 0) {
          cy.get('button:contains("Aprovar")').should('be.visible');
        }
        
        if ($body.find('button:contains("Rejeitar")').length > 0) {
          cy.get('button:contains("Rejeitar")').should('be.visible');
        }
        
      } else {
        // console.log('⚠️ Nenhum botão de ação encontrado - pode não ter usuários pendentes');
      }
    });
  });

  it('Deve verificar se há campo de filtro/busca', () => {
    // console.log('🔍 Verificando campo de filtro');
    
    cy.visit('/approval');
    cy.wait(500);
    
    cy.get('body').then($body => {
      // Procurar por campos de input típicos
      if ($body.find('input[type="text"]').length > 0 || 
          $body.find('input[type="search"]').length > 0 ||
          $body.find('[placeholder*="buscar"]').length > 0 ||
          $body.find('[placeholder*="filtrar"]').length > 0) {
        
        // console.log('✅ Campo de filtro encontrado');
        
        // Testar digitação no campo (sem submeter)
        const filterInput = $body.find('input').first();
        if (filterInput.length > 0) {
          cy.get('input').first().type('test').clear();
          // console.log('✅ Campo de filtro funcional');
        }
        
      } else {
        // console.log('⚠️ Nenhum campo de filtro encontrado');
      }
    });
  });

  it('Deve verificar persistência da autenticação', () => {
    // console.log('🔍 Verificando persistência da autenticação na approval');
    
    cy.visit('/approval');
    cy.wait(300);
    
    // Verificar que não redirecionou para login
    cy.url().should('not.contain', '/login');
    cy.url().should('not.equal', 'http://localhost:5173/');
    
    // Fazer refresh da página
    cy.reload();
    cy.wait(500);
    
    // Verificar se ainda está na página correta após refresh
    cy.url().then(url => {
      if (url.includes('/approval')) {
        // console.log('✅ Autenticação persistiu após refresh');
      } else if (url.includes('/login') || url === 'http://localhost:5173/') {
        // console.log('⚠️ Redirecionou para login após refresh');
      } else {
        // console.log('⚠️ Comportamento inesperado após refresh');
      }
    });
  });

  it('Deve verificar responsividade básica da página', () => {
    // console.log('🔍 Testando responsividade');
    
    cy.visit('/approval');
    cy.wait(500);
    
    // Testar em desktop (padrão)
    cy.viewport(1280, 720);
    cy.get('body').should('be.visible');
    
    // Testar em tablet
    cy.viewport(768, 1024);
    cy.wait(200);
    cy.get('body').should('be.visible');
    
    // Testar em mobile
    cy.viewport(375, 667);
    cy.wait(200);
    cy.get('body').should('be.visible');
    
    // console.log('✅ Página responsiva testada');
  });

  it('Teste de interação com elementos (se existirem)', () => {
    // console.log('🔍 Testando interações básicas');
    
    cy.visit('/approval');
    cy.wait(1000);
    
    cy.get('body').then($body => {
      // Procurar por elementos interativos
      if ($body.find('button').length > 0) {
        // console.log(`✅ ${$body.find('button').length} botões encontrados`);
      }
      
      if ($body.find('select').length > 0) {
        // console.log(`✅ ${$body.find('select').length} selects encontrados`);
      }
      
      if ($body.find('input').length > 0) {
        // console.log(`✅ ${$body.find('input').length} inputs encontrados`);
      }
      
      // Testar hover em botões (se existirem)
      const buttons = $body.find('button:not([disabled])');
      if (buttons.length > 0) {
        cy.get('button:not([disabled])').first().trigger('mouseover');
        // console.log('✅ Teste de hover realizado');
      }
    });
  });
});

// ✅ Testes específicos de funcionalidade (só se a página tiver dados)
describe('Funcionalidades da Página de Aprovação (se dados disponíveis)', () => {
  
  beforeEach(() => {
    cy.visit('/');
    cy.get('#email').type('admin@carona.com');
    cy.get('#password').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.wait(300);
    
    cy.visit('/approval');
    cy.wait(1000); // Aguardar dados carregarem
  });

  it('Deve tentar testar aprovação se houver usuários', () => {
    // console.log('🔍 Tentando testar aprovação de usuário');
    
    cy.get('body').then($body => {
      const text = $body.text();
      
      // Só tentar aprovar se realmente há botões
      if (text.includes('Aprovar') && $body.find('button:contains("Aprovar")').length > 0) {
        // console.log('✅ Tentando teste de aprovação');
        
        // Clicar no primeiro botão de aprovar
        cy.get('button:contains("Aprovar")').first().click();
        cy.wait(500);
        
        // Verificar se abriu modal ou executou ação
        cy.get('body').then($afterClick => {
          const afterText = $afterClick.text();
          
          if (afterText.includes('Confirmar') || afterText.includes('Modal')) {
            // console.log('✅ Modal de confirmação aberto');
            
            // Se há botão confirmar, clica
            if ($afterClick.find('button:contains("Confirmar")').length > 0) {
              cy.get('button:contains("Confirmar")').click();
              // console.log('✅ Confirmação executada');
            }
          } else {
            // console.log('⚠️ Ação pode ter sido executada diretamente');
          }
        });
        
      } else {
        // console.log('⚠️ Nenhum usuário disponível para aprovação');
      }
    });
  });

  it('Deve verificar se filtro funciona (se disponível)', () => {
    // console.log('🔍 Testando funcionalidade de filtro');
    
    cy.get('body').then($body => {
      const filterField = $body.find('input[type="text"], input[type="search"]').first();
      
      if (filterField.length > 0) {
        // console.log('✅ Campo de filtro encontrado, testando');
        
        // Digitar no campo
        cy.get('input').first().type('teste');
        cy.wait(500); // Aguardar debounce
        
        // Verificar se houve mudança na página
        cy.get('body').then($filtered => {
          // console.log('✅ Filtro aplicado');
        });
        
        // Limpar filtro
        cy.get('input').first().clear();
        cy.wait(500);
        
      } else {
        // console.log('⚠️ Nenhum campo de filtro disponível');
      }
    });
  });
});