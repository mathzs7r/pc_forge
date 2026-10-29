// ============================================================
// MOTOR DE COMPATIBILIDADE — "Monte seu PC"
// Deduções TÉCNICAS a partir do NOME do produto (puro, sem
// DOM, testável via Node):
//   analisar(peca)                            -> { socket, ddr, tdp, watts, comprimento, form, motivo... }
//   compativel(etapaId, peca, montagem)      -> { ok: bool, motivo: string }
//   resumo(montagem)                         -> { consumo, conflitos[], avisoFonte }
//
// Peças sem padrão reconhecível ficam com specs desconhecidas:
// aparecem marcadas como "sem dados técnicos", não escondidas.
// ============================================================
(function () {
    const texto = (v) => String(v || '').toLowerCase();

    // ---------- PROCESSADOR ----------
    function analisarCPU(nome) {
        const n = texto(nome);
        let socket = null, tdp = null, marca = null;

        if (/intel core ultra/.test(n)) {
            socket = 'LGA1851';
            tdp = /ultra 9/.test(n) ? 125 : /ultra 7/.test(n) ? 65 : 100;
            marca = 'intel';
        } else if (/i[3579]-\d{4,5}/.test(n)) {
            socket = 'LGA1700';
            marca = 'intel';
            const k = /\d{4,5}k(x)?(\s|$)/.test(n);
            tdp = k ? 125 : 65;
        } else if (/ryzen/.test(n)) {
            marca = 'amd';
            const serie = /ryzen\s([3579])\s(\d{4})/.exec(n);
            if (serie) {
                const numero = Number(serie[2]);
                socket = numero < 6000 ? 'AM4' : 'AM5'; // 4000/5000 = AM4; 6000+ = AM5
                tdp = serie[1] === '9' ? 120 : serie[1] === '7' ? 105 : 65;
                if (/x(3d)?$|x(t)?(\s|$)/.test(n) && serie[1] !== '3') tdp += 15;
            }
        }
        return { socket, tdp, marca };
    }

    // ---------- PLACA-MÃE (chipset → socket, DDR, form factor) ----------
    function analisarMae(nome) {
        const n = texto(nome);
        let socket = null, ddr = null, form = null, chipset = null;

        if (/(a520|b450|x570|b550)/.test(n)) {
            chipset = /(a520|b450|x570|b550)/.exec(n)[1].toUpperCase();
            socket = 'AM4'; ddr = 'DDR4';
        } else if (/(a620|b650|x670)/.test(n)) {
            chipset = /(a620|b650|x670e?)/.exec(n)[1].toUpperCase();
            socket = 'AM5'; ddr = 'DDR5';
        } else if (/(h610|b660|b760|z690|z790)/.test(n)) {
            chipset = /(h610|b660|b760|z690|z790)/.exec(n)[1].toUpperCase();
            socket = 'LGA1700';
            ddr = /ddr4/.test(n) ? 'DDR4' : /ddr5/.test(n) ? 'DDR5' : null;
            if (!ddr) { ddr = 'DDR4'; } // guess conservador p/ 12ª-14ª sem menção
        }
        // form factor: sufixo M (= micro) ou "m" após chipset
        form = /(\w+?m\b|m$)/.test(n) ? 'mATX'
            : /e-atx|full tower/.test(n) ? 'E-ATX' : null;
        // compatibilidade de gabinete usa "maiorForm": mATX cabe em ATX
        return { socket, ddr, form: form || 'ATX', chipset };
    }

    // ---------- MEMÓRIA ----------
    function analisarRAM(nome) {
        const n = texto(nome);
        const ddr = /ddr5/.test(n) ? 'DDR5' : /ddr4/.test(n) ? 'DDR4' : null;
        const mhz = /(\d{4})\s?mhz/.exec(n) ? Number(/(\d{4})\s?mhz/.exec(n)[1]) : null;
        return { ddr, mhz };
    }

    // ---------- PLACA DE VÍDEO (consumo e comprimento típico) ----------
    function analisarGPU(nome) {
        const n = texto(nome);
        const tabelas = [
            [/gtx\s?1650/, { watts: 75, comprimento: 200 }],
            [/rtx\s?3050/, { watts: 130, comprimento: 240 }],
            [/rtx\s?3060/, { watts: 170, comprimento: 240 }],
            [/rtx\s?4060\s?ti/, { watts: 160, comprimento: 240 }],
            [/rtx\s?4060/, { watts: 115, comprimento: 240 }],
            [/rtx\s?4070\s?ti\s?super/, { watts: 285, comprimento: 310 }],
            [/rtx\s?4070\s?ti/, { watts: 285, comprimento: 300 }],
            [/rtx\s?4070\s?super/, { watts: 220, comprimento: 280 }],
            [/rtx\s?4070/, { watts: 200, comprimento: 280 }],
            [/rtx\s?4080/, { watts: 320, comprimento: 310 }],
            [/rtx\s?4090/, { watts: 450, comprimento: 336 }],
            [/rtx\s?3080/, { watts: 320, comprimento: 285 }],
            [/rx\s?6500\s?xt/, { watts: 107, comprimento: 190 }],
            [/rx\s?6600(?!0)/, { watts: 132, comprimento: 240 }],
            [/rx\s?6700\s?xt/, { watts: 230, comprimento: 290 }],
            [/rx\s?7600/, { watts: 165, comprimento: 240 }],
            [/rx\s?7700\s?xt/, { watts: 245, comprimento: 290 }],
            [/rx\s?7800\s?xt/, { watts: 263, comprimento: 290 }],
            [/rx\s?7900\s?xtx/, { watts: 355, comprimento: 320 }],
            [/rx\s?7900\s?xt/, { watts: 315, comprimento: 310 }],
            [/arc\s?a770/, { watts: 225, comprimento: 270 }],
            [/arc\s?a750/, { watts: 225, comprimento: 270 }]
        ];
        for (const [padrao, dados] of tabelas) {
            if (padrao.test(n)) return { ...dados, vr: /(\d+)\s?gb/.exec(n) ? Number(/(\d+)\s?gb/.exec(n)[1]) : null };
        }
        // "RTX 4050 Laptop" e similares: energia típica moderada
        return { watts: null, comprimento: null };
    }

    // ---------- FONTE ----------
    function analisarFonte(nome) {
        const watts = /(\d{3,4})\s?w/.exec(texto(nome)) ? Number(/(\d{3,4})\s?w/.exec(texto(nome))[1]) : null;
        const selo = /80 plus (gold|platinum|bronze)/.exec(texto(nome));
        return { watts, selo: selo ? selo[1] : null };
    }

    // ---------- COOLER (dentro de "Acessórios") ----------
    function analisarCooler(nome) {
        const n = texto(nome);
        if (/cool(er)?\s?box\s?intel/.test(n)) return { sockets: ['LGA1700', 'LGA1851'], tdpMax: 90 };
        if (/water\s?cool(er)?/.test(n)) return { sockets: null /* todos */, tdpMax: 240 };
        if (/cool(er)?\s?cpu|torre/.test(n)) return { sockets: null /* todos */, tdpMax: 180 };
        return null;
    }

    // ---------- GABINETE ----------
    function analisarGabinete(nome) {
        const n = texto(nome);
        const mm = /at[ée]\s?(\d{3})\s?mm/.exec(n) ? Number(/at[ée]\s?(\d{3})\s?mm/.exec(n)[1]) : null;
        let form = null;
        if (/full tower/.test(n)) form = 'Full Tower';
        else if (/mini tower/.test(n)) form = 'Mini Tower';
        else if (/mid tower/.test(n)) form = 'Mid Tower';
        return { mm, form };
    }

    // ---------- fachada: analisar qualquer peça ----------
    // Categorias têm acento ("Placas-mãe", "Placas de Vídeo"): normalizamos
    // removendo os acentos antes do includes, senão nada casaria.
    function semAcento(v) {
        return texto(v).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    function analisar(peca) {
        const categoria = semAcento(peca.CATEGORIA);
        const nome = peca.NOME;
        if (categoria.includes('processador')) return { ...analisarCPU(nome), tipo: 'processador' };
        if (categoria.includes('mae')) return { ...analisarMae(nome), tipo: 'placa-mae' };
        if (categoria.includes('mem')) return { ...analisarRAM(nome), tipo: 'memoria' };
        if (categoria.includes('video')) return { ...analisarGPU(nome), tipo: 'gpu' };
        if (categoria.includes('fonte')) return { ...analisarFonte(nome), tipo: 'fonte' };
        if (categoria.includes('acess') || categoria.includes('refriger')) return { ...(analisarCooler(nome) || {}), tipo: 'cooler' };
        if (categoria.includes('gabinete')) return { ...analisarGabinete(nome), tipo: 'gabinete' };
        if (categoria.includes('sistem')) return { padrao: 'chave + instalação', tipo: 'so' };
        if (categoria.includes('servic')) return { padrao: 'serviço', tipo: 'servico' };
        // armazenamento: só diz o padrão (SATA/NVMe) — toda mobo moderna aceita
        if (categoria.includes('armazen')) return { padrao: /nvme/.test(texto(nome)) ? 'M.2 NVMe' : 'SATA', tipo: 'armazenamento' };
        return { tipo: 'outra' };
    }

    // ============ COMPATIBILIDADE ENTRE AS ESCOLHAS ============
    // etapas na ordem do fluxo; cada uma depende das anteriores
    function compativel(etapaId, peca, montagem) {
        const a = analisar(peca);
        const tem = (k) => montagem[k];

        switch (etapaId) {
            case 'placa-mae':
                // primeira pala: qualquer mobo serve (a CPU é que precisa bater)
                return { ok: true };

            case 'processador': {
                const escolhida = tem('placa-mae');
                if (!escolhida) return { ok: true };
                const m = analisar(escolhida);
                if (!a.socket) return { ok: true, semDados: 'soquete do processador não identificado' };
                if (m.socket && m.socket !== a.socket) {
                    return { ok: false, motivo: `Soquete ${m.socket} da placa-mãe ≠ ${a.socket} deste processador` };
                }
                return { ok: true };
            }

            case 'memoria': {
                const escolhida = tem('placa-mae');
                if (!escolhida) return { ok: true };
                const m = analisar(escolhida);
                if (!a.ddr) return { ok: true, semDados: 'padrão DDR não identificado' };
                if (m.ddr && m.ddr !== a.ddr) {
                    return { ok: false, motivo: `${m.ddr} exige memória ${m.ddr}, esta é ${a.ddr}` };
                }
                return { ok: true };
            }

            case 'gpu':
                return { ok: true }; // PCI-e é universal; o teste duro é o gabinete

            case 'armazenamento':
                return { ok: true }; // toda mobo do catálogo aceita SATA/NVMe

            case 'fonte': {
                const r = resumo(montagem);
                const recomendada = Math.ceil(r.consumo * 1.3 / 50) * 50;
                if (a.watts && a.watts < r.consumo) {
                    return { ok: false, motivo: `${a.watts}W é insuficiente (montagem já consome ~${r.consumo}W)` };
                }
                if (a.watts && a.watts < recomendada) {
                    return { ok: true, aviso: `Recomendo ${recomendada}W — ${a.watts}W fica no limite` };
                }
                return a.watts ? { ok: true } : { ok: true, semDados: 'potência (W) não identificada no nome' };
            }

            case 'cooler': {
                const escolhida = tem('processador');
                if (!a || !a.sockets) return { ok: true };
                if (!escolhida) return { ok: true };
                const e = analisar(escolhida);
                if (e.socket === 'AM4' || e.socket === 'AM5') {
                    return { ok: false, motivo: 'Este suporte é só para Intel — para Ryzen use torre/water' };
                }
                if (e.socket && !a.sockets.includes(e.socket)) {
                    return { ok: false, motivo: `Suporta ${a.sockets.join(' e ')}, não ${e.socket}` };
                }
                return { ok: true };
            }

            case 'gabinete': {
                const gpu = tem('gpu');
                const mae = tem('placa-mae');
                if (a.mm && gpu) {
                    const g = analisar(gpu);
                    if (g.comprimento && g.comprimento > a.mm) {
                        return { ok: false, motivo: `Placa de ${g.comprimento}mm não cabe (gabinete aceita até ${a.mm}mm)` };
                    }
                }
                if (mae) {
                    const m = analisar(mae);
                    const precisa = m.form === 'E-ATX' ? 'Full Tower' : 'Mid Tower';
                    if (m.form === 'E-ATX' && (a.form === 'Mini Tower' || a.form === 'Mid Tower')) {
                        return { ok: false, motivo: `Placa-mãe E-ATX exige Full Tower` };
                    }
                    // mATX cabe em qualquer gabinete; ATX não cabe em Mini Tower
                    if (m.form !== 'mATX' && m.form !== 'E-ATX' && a.form === 'Mini Tower') {
                        return { ok: false, motivo: `Placa-mãe ATX não cabe em Mini Tower` };
                    }
                }
                return a.mm ? { ok: true } : { ok: true, semDados: 'limite de mm não identificado' };
            }

            default:
                return { ok: true };
        }
    }

    // ============ RESUMO: consumo total + conflitos cruzados ============
    // O gabinete depende da GPU (e vice-versa). Este varredor final corrige
    // escolhas antigas quando algo novo invalida algo já escolhido.
    function resumo(montagem) {
        const cpu = montagem.processador ? analisar(montagem.processador) : null;
        const gpu = montagem.gpu ? analisar(montagem.gpu) : null;
        const fonte = montagem.fonte ? analisar(montagem.fonte) : null;

        const consumo = 60 + (cpu && cpu.tdp ? cpu.tdp : 0) + (gpu && gpu.watts ? gpu.watts : 0);

        const conflitos = [];
        // revalida as etapas com as escolhas atuais (ordem do fluxo)
        const ordem = ['placa-mae', 'memoria', 'fonte', 'cooler', 'gabinete'];
        for (const etapa of ordem) {
            const peca = montagem[etapa];
            if (!peca) continue;
            // a etapa conta com o estado atual — se ela mesma não passa, avisa
            const teste = compativel(etapa, peca, semEssa(montagem, etapa));
            if (!teste.ok) conflitos.push({ etapa, peca: peca.NOME, motivo: teste.motivo });
        }

        let avisoFonte = null;
        if (fonte && fonte.watts) {
            const recomendada = Math.ceil(consumo * 1.3 / 50) * 50;
            if (fonte.watts < consumo) {
                avisoFonte = `A fonte de ${fonte.watts}W não aguenta ~${consumo}W — troque por ${recomendada}W ou mais.`;
            } else if (fonte.watts < consumo * 1.3) {
                avisoFonte = `Fonte no limite: ${fonte.watts}W para ~${consumo}W de consumo. Ideal: ${recomendada}W.`;
            }
        }

        return { consumo, conflitos, avisoFonte, recomendada: Math.ceil(consumo * 1.3 / 50) * 50 };
    }

    function semEssa(montagem, etapa) {
        const copia = { ...montagem };
        delete copia[etapa];
        return copia;
    }

    window.pcForgeCompat = { analisar, compativel, resumo };
})();
