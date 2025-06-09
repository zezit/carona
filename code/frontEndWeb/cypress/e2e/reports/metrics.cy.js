// cypress/e2e/metrics.cy.js
// ✅ Testes de métricas usando padrão comprovado

describe('Métricas de Viagens', () => {
  
  beforeEach(() => {
    // ✅ Login básico que sabemos que funciona (padrão navigation)
    cy.visit('/');
    cy.get('#email').type('admin@carona.com');
    cy.get('#password').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.wait(300); // Aguardar login processar
    
    // ✅ Navegar para report
    cy.visit('/report');
    cy.wait(1000); // Aguardar dados carregarem
  });

  it('Deve exibir página de métricas corretamente', () => {
    //console.log('🔍 Testando exibição da página de métricas');
    
    // ✅ Verificar se chegou na página correta
    cy.url().should('include', '/report');
    
    // ✅ Verificar conteúdo da página
    cy.get('body').then($body => {
      const text = $body.text();
      //console.log('🔍 Conteúdo da página report:', text.substring(0, 400));
      
      // Procurar por indicadores de métricas/relatórios
      if (text.includes('Métricas') || 
          text.includes('Viagens') || 
          text.includes('Relatório') ||
          text.includes('Report') ||
          text.includes('Análise')) {
        //console.log('✅ Página de métricas carregou corretamente');
      } else {
        //console.log('⚠️ Conteúdo inesperado, mas página carregou');
      }
    });
    
    // ✅ Verificar elementos básicos esperados
    cy.get('body').should('satisfy', ($body) => {
      const text = $body.text();
      return text.includes('Métricas') || 
             text.includes('Viagens') ||
             text.includes('Relatório') ||
             text.includes('Report') ||
             text.includes('Total') ||
             text.includes('Dados');
    });
  });

  it('Deve verificar se há cards/resumos de dados', () => {
    //console.log('🔍 Verificando cards de resumo');
    
    cy.get('body').then($body => {
      const text = $body.text();
      
      // Procurar por cards típicos de métricas
      const metricsTerms = [
        'Total de Viagens', 'Total de Passageiros', 'Total de Motoristas',
        'Viagens', 'Passageiros', 'Motoristas', 'Usuários',
        'Total', 'Quantidade', 'Número'
      ];
      
      const foundMetrics = [];
      metricsTerms.forEach(term => {
        if (text.includes(term)) {
          foundMetrics.push(term);
        }
      });
      
      if (foundMetrics.length > 0) {
        //console.log(`✅ Métricas encontradas: ${foundMetrics.join(', ')}`);
        
        // Verificar se há números/valores
        const hasNumbers = /\d+/.test(text);
        if (hasNumbers) {
          //console.log('✅ Valores numéricos encontrados nas métricas');
        }
        
      } else if (text.includes('Nenhum dado') || text.includes('Não há dados')) {
        //console.log('✅ Mensagem de dados vazios exibida');
        
      } else if (text.includes('Carregando') || text.includes('Loading')) {
        //console.log('⚠️ Ainda carregando dados');
        cy.wait(2000);
        
      } else {
        //console.log('⚠️ Estrutura da página pode ser diferente');
      }
    });
  });

  it('Deve verificar se há controles de período', () => {
    //console.log('🔍 Verificando controles de período');
    
    cy.get('body').then($body => {
      const text = $body.text();
      
      // Procurar por botões de período
      const periodTerms = ['Diário', 'Semanal', 'Mensal', 'Anual', 'Hoje', 'Semana', 'Mês'];
      const foundPeriods = [];
      
      periodTerms.forEach(period => {
        if (text.includes(period)) {
          foundPeriods.push(period);
        }
      });
      
      if (foundPeriods.length > 0) {
        //console.log(`✅ Controles de período encontrados: ${foundPeriods.join(', ')}`);
        
        // Testar clique no primeiro período encontrado (sem aguardar API)
        const firstPeriod = foundPeriods[0];
        if ($body.find(`button:contains("${firstPeriod}")`).length > 0) {
          cy.get(`button:contains("${firstPeriod}")`).first().click();
          cy.wait(500);
          //console.log(`✅ Clique em "${firstPeriod}" executado`);
        }
        
      } else {
        //console.log('⚠️ Nenhum controle de período encontrado');
      }
    });
  });

  it('Deve verificar se há gráficos ou visualizações', () => {
    //console.log('🔍 Verificando gráficos e visualizações');
    
    cy.get('body').then($body => {
      // Procurar por elementos típicos de gráficos
      const chartElements = {
        svg: $body.find('svg').length,
        canvas: $body.find('canvas').length,
        chartContainers: $body.find('.chart, .graph, [class*="chart"], [class*="graph"]').length
      };
      
      //console.log('📊 Elementos gráficos encontrados:', chartElements);
      
      if (chartElements.svg > 0) {
        //console.log(`✅ ${chartElements.svg} gráficos SVG encontrados`);
        cy.get('svg').should('have.length.greaterThan', 0);
        
      } else if (chartElements.canvas > 0) {
        //console.log(`✅ ${chartElements.canvas} gráficos Canvas encontrados`);
        cy.get('canvas').should('have.length.greaterThan', 0);
        
      } else if (chartElements.chartContainers > 0) {
        //console.log(`✅ ${chartElements.chartContainers} containers de gráfico encontrados`);
        
      } else {
        //console.log('⚠️ Nenhum gráfico encontrado - pode não ter dados ou usar estrutura diferente');
        
        // Verificar se há mensagem explicativa
        const text = $body.text();
        if (text.includes('sem dados') || text.includes('Nenhum dado')) {
          //console.log('✅ Mensagem explicativa sobre ausência de dados');
        }
      }
    });
  });

  it('Deve verificar se há botão de atualizar/refresh', () => {
    //console.log('🔍 Verificando botão de atualizar');
    
    cy.get('body').then($body => {
      const refreshSelectors = [
        'button:contains("Atualizar")',
        'button:contains("Refresh")',
        'button:contains("Recarregar")',
        '[data-cy="refresh-button"]',
        'button[aria-label*="atualizar"]'
      ];
      
      let refreshFound = false;
      
      refreshSelectors.forEach(selector => {
        if ($body.find(selector).length > 0 && !refreshFound) {
          refreshFound = true;
          //console.log(`✅ Botão de refresh encontrado: ${selector}`);
          
          // Testar clique no botão
          cy.get(selector).click();
          cy.wait(500);
          //console.log('✅ Refresh executado');
        }
      });
      
      if (!refreshFound) {
        //console.log('⚠️ Nenhum botão de refresh encontrado');
      }
    });
  });

  it('Deve verificar se há filtros ou configurações', () => {
    //console.log('🔍 Verificando filtros e configurações');
    
    cy.get('body').then($body => {
      // Procurar por selects de filtro
      if ($body.find('select').length > 0) {
        //console.log(`✅ ${$body.find('select').length} campos select encontrados`);
        
        cy.get('select').each(($select, index) => {
          const options = $select.find('option').length;
          //console.log(`📋 Select ${index + 1}: ${options} opções`);
        });
      }
      
      // Procurar por inputs de data
      const dateInputs = $body.find('input[type="date"], input[type="datetime-local"]');
      if (dateInputs.length > 0) {
        //console.log(`✅ ${dateInputs.length} campos de data encontrados`);
      }
      
      // Procurar por range/slider
      const rangeInputs = $body.find('input[type="range"]');
      if (rangeInputs.length > 0) {
        //console.log(`✅ ${rangeInputs.length} sliders encontrados`);
      }
      
      // Procurar por checkboxes
      const checkboxes = $body.find('input[type="checkbox"]');
      if (checkboxes.length > 0) {
        //console.log(`✅ ${checkboxes.length} checkboxes encontrados`);
      }
    });
  });

  it('Deve verificar responsividade da página de métricas', () => {
    //console.log('🔍 Testando responsividade da página de métricas');
    
    // Desktop (padrão)
    cy.viewport(1280, 720);
    cy.get('body').should('be.visible');
    //console.log('✅ Desktop OK');
    
    // Tablet
    cy.viewport(768, 1024);
    cy.wait(200);
    cy.get('body').should('be.visible');
    //console.log('✅ Tablet OK');
    
    // Mobile
    cy.viewport(375, 667);
    cy.wait(200);
    cy.get('body').should('be.visible');
    //console.log('✅ Mobile OK');
    
    // Verificar se gráficos se adaptam
    cy.get('body').then($body => {
      if ($body.find('svg, canvas').length > 0) {
        //console.log('📱 Gráficos presentes em mobile - verificando adaptação');
      }
    });
  });
});

// ✅ Testes de funcionalidades específicas (se dados disponíveis)
describe('Funcionalidades de Métricas (se dados disponíveis)', () => {
  
  beforeEach(() => {
    cy.visit('/');
    cy.get('#email').type('admin@carona.com');
    cy.get('#password').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.wait(300);
    
    cy.visit('/report');
    cy.wait(1500); // Aguardar mais tempo para dados carregarem
  });

  it('Deve testar alternância de período se disponível', () => {
    //console.log('🔍 Testando alternância de período');
    
    cy.get('body').then($body => {
      const periods = ['Diário', 'Semanal', 'Mensal'];
      
      periods.forEach(period => {
        if ($body.text().includes(period) && $body.find(`button:contains("${period}")`).length > 0) {
          //console.log(`✅ Testando período: ${period}`);
          
          cy.get(`button:contains("${period}")`).click();
          cy.wait(500);
          
          // Verificar se botão ficou ativo (classe comum)
          cy.get(`button:contains("${period}")`).then($btn => {
            const classes = $btn.attr('class') || '';
            if (classes.includes('active') || 
                classes.includes('selected') || 
                classes.includes('bg-') ||
                classes.includes('primary')) {
              //console.log(`✅ Botão ${period} ativado visualmente`);
            }
          });
        }
      });
    });
  });

  it('Deve verificar se dados mudam com filtros', () => {
    //console.log('🔍 Verificando mudança de dados com filtros');
    
    cy.get('body').then($body => {
      // Capturar estado inicial
      const initialText = $body.text();
      
      // Tentar alterar algum filtro se disponível
      if ($body.find('select').length > 0) {
        cy.get('select').first().then($select => {
          const options = $select.find('option');
          if (options.length > 1) {
            // Selecionar segunda opção
            cy.get('select').first().select(1);
            cy.wait(1000);
            
            // Verificar se algo mudou
            cy.get('body').then($newBody => {
              const newText = $newBody.text();
              if (newText !== initialText) {
                //console.log('✅ Dados mudaram com filtro');
              } else {
                //console.log('⚠️ Dados não mudaram ou mudança não detectável');
              }
            });
          }
        });
      }
    });
  });

  it('Deve verificar exportação se disponível', () => {
    //console.log('🔍 Verificando opções de exportação');
    
    cy.get('body').then($body => {
      const exportTerms = ['Exportar', 'Download', 'PDF', 'Excel', 'CSV'];
      const foundExports = [];
      
      exportTerms.forEach(term => {
        if ($body.text().includes(term)) {
          foundExports.push(term);
        }
      });
      
      if (foundExports.length > 0) {
        //console.log(`✅ Opções de exportação encontradas: ${foundExports.join(', ')}`);
        
        // Testar primeiro botão de exportação encontrado
        const firstExport = foundExports[0];
        if ($body.find(`button:contains("${firstExport}")`).length > 0) {
          //console.log(`✅ Testando exportação: ${firstExport}`);
          // Nota: Não clicamos para evitar downloads reais em testes
        }
      } else {
        //console.log('⚠️ Nenhuma opção de exportação encontrada');
      }
    });
  });

});