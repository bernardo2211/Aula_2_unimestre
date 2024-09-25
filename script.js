// rolar navbar
$(window).scroll(function () {
    if ($(this).scrollTop() > 50) { 
        $('.navbar').addClass('scrolled');
    } else {
        $('.navbar').removeClass('scrolled');
    }
});

// Animaçoo de Botoes
$('.add-to-cart').click(function() {
    const button = $(this);
    button.text('Adicionado!').css('background-color', 'green');

    setTimeout(() => {
        button.text('Adicionar ao Carrinho').css('background-color', '');
    }, 1000);
});

// Função de filtragem
$('.price-filter').change(function() {
    const selectedFilters = [];

    // Pega todos os checkboxes que estão marcados
    $('.price-filter:checked').each(function() {
        selectedFilters.push($(this).val());
    });

    // Filtrar produtos
    $('#productList .col-md-4').each(function() {
        const price = parseFloat($(this).find('.card-text').last().text().replace('R$', '').trim());

        // Exibe o produto se o preço estiver dentro de algum dos filtros selecionados
        let showProduct = false;
        if (selectedFilters.includes('all')) {
            showProduct = true;
        } else {
            for (const filter of selectedFilters) {
                if (price <= filter) {
                    showProduct = true;
                    break;
                }
            }
        }

        if (showProduct) {
            $(this).show();
        } else {
            $(this).hide();
        }
    });

    // Exibe mensagem se nenhum produto for encontrado
    const visibleProducts = $('#productList .col-md-4:visible').length;
    if (visibleProducts === 0) {
        $('#productList').html('<p>Nenhum produto encontrado</p>');
    }
});




// Flip do cartão
$('#flip-to-back').on('click', function() {
    $('#credit-card').addClass('flipped');
});

$('#flip-to-front').on('click', function() {
    $('#credit-card').removeClass('flipped');
});

// Formatação do número do cartão
$('.checkout-card').on('input', function() {
    let value = $(this).val().replace(/\D/g, ''); 
    if (value.length > 16) value = value.slice(0, 16); 
    $(this).val(value.replace(/(\d{4})(?=\d)/g, '$1 ')); 
});

// Carrinho de Compras
let cart = [];
let total = 0;
let selectedInstallments = 0; // Número de parcelas selecionado

// Função para adicionar itens ao carrinho
$('.add-to-cart').click(function () {
    const productCard = $(this).closest('.card');
    const productName = productCard.find('.card-text').first().text();
    const productPrice = parseFloat(productCard.find('.card-text:nth-child(2)').text().replace('R$', '').trim());
    const productImgSrc = productCard.find('img').attr('src');

    cart.push({ name: productName, price: productPrice, imgSrc: productImgSrc });
    updateCart();
});

// Atualiza o carrinho
function updateCart() {
    const cartItems = $('#cartItems');
    cartItems.empty();
    total = 0;

    cart.forEach((item, index) => {
        cartItems.append(`
            <li data-index="${index}">
                <img src="${item.imgSrc}" alt="${item.name}" class="cart-item-img">
                <span>${item.name} - R$ ${item.price.toFixed(2)}</span>
                <button class="remove-item btn btn-danger btn-sm ml-2">Remover</button>
            </li>
        `);
        total += item.price;
    });

    $('#cartTotal').text(total.toFixed(2));

    if (total > 0) {
        $('#installmentsSection').show();
    } else {
        $('#installmentsSection').hide();
    }

    // Verifica se os dados do cartão e parcelas estão preenchidos para liberar o botão de compra
    validatePurchaseButton();
}

// Exibe ou oculta o menu de parcelas personalizado
$('#installmentDropdownBtn').click(function() {
    $('#installmentOptions').toggle();
});

// Lida com a seleção de parcelas
$('#installmentOptions').on('click', '.dropdown-item', function() {
    selectedInstallments = $(this).data('value');
    const installmentAmount = (total / selectedInstallments).toFixed(2);

    // Atualiza o texto do botão com a opção de parcelas escolhida
    $('#installmentDropdownBtn').text(`${selectedInstallments} vez(es) - R$ ${installmentAmount} por parcela`);

    // Atualiza as informações de parcelamento
    $('#installmentInfo').text(`Você selecionou ${selectedInstallments} vez(es). Valor de cada parcela: R$ ${installmentAmount}`);

    // Oculta o menu de opções após selecionar
    $('#installmentOptions').hide();

    // Verifica se os dados do cartão e parcelas estão preenchidos para liberar o botão de compra
    validatePurchaseButton();
});

// Remover item do carrinho
$(document).on('click', '.remove-item', function () {
    const itemElement = $(this).closest('li');
    const itemIndex = itemElement.data('index');

    itemElement.slideUp(400, function () {
        cart.splice(itemIndex, 1);
        updateCart();
    });
});

// Valida os campos do cartão de crédito
function validateCreditCard() {
    const cardNumber = $('.checkout-card').val();
    const cardName = $('.checkout-name').val();
    const cardExpMM = $('.checkout-exp').first().val();
    const cardExpYY = $('.checkout-exp').last().val();
    const cardCVV = $('.checkout-cvc').val();

    // Verifica se os campos do cartão estão preenchidos corretamente
    const isCardValid = cardNumber.length === 19 && cardName.length > 0 && cardExpMM.length === 2 && cardExpYY.length === 2 && cardCVV.length === 3;
    
    return isCardValid;
}

// Valida se os dados do cartão e o número de parcelas foram selecionados
function validatePurchaseButton() {
    if (validateCreditCard() && selectedInstallments > 0) {
        $('#finalizePurchase').prop('disabled', false);
    } else {
        $('#finalizePurchase').prop('disabled', true);
    }
}

// Detecta alterações nos campos de cartão de crédito e verifica se tudo está preenchido
$('.checkout-card, .checkout-name, .checkout-exp, .checkout-cvc').on('input', validatePurchaseButton);

// Finalizar compra
$('#finalizePurchase').click(function() {
    const installmentAmount = (total / selectedInstallments).toFixed(2);

    // Exibe a mensagem de compra finalizada com detalhes
    $('#purchaseMessage').html(`Compra finalizada! Total: R$ ${total.toFixed(2)}, em ${selectedInstallments} vez(es) de R$ ${installmentAmount}.`).slideDown();

    // A mensagem some após 5 segundos
    setTimeout(function() {
        $('#purchaseMessage').slideUp();
    }, 5000);

    // Reseta os dados de compra (opcional)
    cart = [];
    total = 0;
    selectedInstallments = 0;
    updateCart();

    // Reseta o formulário de cartão
    $('.checkout-card, .checkout-name, .checkout-exp, .checkout-cvc').val('');
    $('#installmentDropdownBtn').text('Escolher Parcelas');
    $('#installmentInfo').text('');
});

// Inicializar o carrinho
updateCart();






    $(document).ready(function() {
        // Mostrar/ocultar as opções de filtro
        $('#toggleFilters').click(function() {
            $('#filterOptions').slideToggle(400, function() {
                if ($('#filterOptions').is(':visible')) {
                    $('#toggleFilters').text('Ocultar filtros');
                } else {
                    $('#toggleFilters').text('Mostrar filtros');
                }
            });
        });
    
        // Aplicar o filtro quando uma das opções for clicada
        $('.price-filter-option').click(function() {
            const filterValue = $(this).data('value'); // Pega o valor do filtro (50, 500 ou "all")
            
            $('#productList .col-md-4').each(function() {
                const price = parseFloat($(this).find('.card-text').last().text().replace('R$', '').trim());
    
                if (filterValue === 'all' || price <= filterValue) {
                    $(this).show();
                } else {
                    $(this).hide();
                }
            });
    
            // Exibe mensagem se nenhum produto for encontrado
            const visibleProducts = $('#productList .col-md-4:visible').length;
            if (visibleProducts === 0) {
                $('#productList').html('<p>Nenhum produto encontrado</p>');
            }
        });
    });
    