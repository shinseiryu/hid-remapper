import crc32 from './crc.js';
import usages from './usages.js';
import examples from './examples.js';

const REPORT_ID_CONFIG = 100;
const REPORT_ID_MONITOR = 101;
const STICKY_FLAG = 1 << 0;
const TAP_FLAG = 1 << 1;
const HOLD_FLAG = 1 << 2;
const CONFIG_SIZE = 32;
const CONFIG_VERSION = 18;
const VENDOR_ID = 0xCAFE;
const PRODUCT_ID = 0xBAF2;
const DEFAULT_PARTIAL_SCROLL_TIMEOUT = 1000000;
const DEFAULT_TAP_HOLD_THRESHOLD = 200000;
const DEFAULT_GPIO_DEBOUNCE_TIME = 5;
const DEFAULT_SCALING = 1000;
const DEFAULT_MACRO_ENTRY_DURATION = 1;

const NLAYERS = 8;
const NMACROS = 32;
const NEXPRESSIONS = 8;
const MACRO_ITEMS_IN_PACKET = 6;
const IGNORE_AUTH_DEV_INPUTS_FLAG = 1 << 4;
const GPIO_OUTPUT_MODE_FLAG = 1 << 5;
const NORMALIZE_GAMEPAD_INPUTS_FLAG = 1 << 6;
const HUB_PORT_NONE = 255;
const MAX_PAIRED_DEVICES = 32;

const QUIRK_FLAG_RELATIVE_MASK = 0b10000000;
const QUIRK_FLAG_SIGNED_MASK = 0b01000000;
const QUIRK_SIZE_MASK = 0b00111111;

const LAYERS_USAGE_PAGE = 0xFFF10000;
const EXPR_USAGE_PAGE = 0xFFF30000;
const MIDI_USAGE_PAGE = 0xFFF70000;
const BUTTON_USAGE_PAGE = 0x00090000;

const RESET_INTO_BOOTSEL = 1;
const SET_CONFIG = 2;
const GET_CONFIG = 3;
const CLEAR_MAPPING = 4;
const ADD_MAPPING = 5;
const GET_MAPPING = 6;
const PERSIST_CONFIG = 7;
const GET_OUR_USAGES = 8;
const GET_THEIR_USAGES = 9;
const SUSPEND = 10;
const RESUME = 11;
const PAIR_NEW_DEVICE = 12;
const CLEAR_BONDS = 13;
const FLASH_B_SIDE = 14;
const CLEAR_MACROS = 15;
const APPEND_TO_MACRO = 16;
const GET_MACRO = 17;
const INVALID_COMMAND = 18;
const CLEAR_EXPRESSIONS = 19;
const APPEND_TO_EXPRESSION = 20;
const GET_EXPRESSION = 21;
const SET_MONITOR_ENABLED = 22;
const CLEAR_QUIRKS = 23;
const ADD_QUIRK = 24;
const GET_QUIRK = 25;
const GET_PAIRED_DEVICE = 26;
const FORGET_DEVICE = 27;
const SET_WEB_SCAN = 28;
const GET_SCAN_RESULT = 29;
const CONNECT_DEVICE = 30;
const GET_BT_EVENT = 31;

const SCAN_RESULTS_MAX = 32;
const SCAN_RESULT_FLAG_CONNECTABLE = 1 << 0;
const SCAN_RESULT_FLAG_HID_IN_ADV = 1 << 1;
const SCAN_RESULT_FLAG_HID_IN_SCAN_RSP = 1 << 2;
const SCAN_RESULT_FLAG_PAIRED = 1 << 3;
const SCAN_RESULT_FLAG_CONNECTED = 1 << 4;
const SCAN_RESULT_FLAG_GOT_SCAN_RSP = 1 << 5;

const BT_EVENT = {
    WEB_SCAN_STARTED: 1,
    WEB_SCAN_ENDED: 2,
    CONNECTING: 3,
    CONNECT_FAILED: 4,
    CONNECTED: 5,
    SECURITY_CHANGED: 6,
    SECURITY_FAILED: 7,
    PASSKEY_DISPLAY: 8,
    PAIRING_CANCELLED: 9,
    PAIRING_COMPLETE: 10,
    PAIRING_FAILED: 11,
    HID_SETUP_FAILED: 12,
    READY: 13,
    DISCONNECTED: 14,
    FORGOTTEN: 15,
    ALL_FORGOTTEN: 16,
    CONN_PARAMS_UPDATED: 17,
};

// Bluetooth spec HCI error codes, the ones likely to show up here
const HCI_REASONS = {
    0x02: "the device didn't answer (is it still in pairing mode, and in range?)",
    0x05: "authentication failed",
    0x06: "key missing (the device may have forgotten the pairing; forget it here and pair again)",
    0x08: "connection timed out (out of range or switched off?)",
    0x13: "the device ended the connection",
    0x14: "the device ended the connection (low resources)",
    0x15: "the device is powering off",
    0x16: "the remapper ended the connection",
    0x1A: "the device doesn't support a required feature",
    0x22: "the device stopped responding",
    0x3B: "the device rejected the connection parameters",
    0x3D: "encryption error",
    0x3E: "the connection couldn't be established",
};

const SECURITY_ERRORS = [
    "no error",
    "authentication failed (wrong passkey, or the passkey wasn't entered in time)",
    "PIN or key missing (the device may have forgotten the pairing; forget it here and pair again)",
    "OOB data not available",
    "the device's security requirements can't be met",
    "pairing not supported",
    "pairing not allowed (is the device in pairing mode?)",
    "invalid parameters",
    "key rejected",
    "unspecified error",
];

const PERSIST_CONFIG_SUCCESS = 1;
const PERSIST_CONFIG_CONFIG_TOO_BIG = 2;

const ops = {
    "PUSH": 0,
    "PUSH_USAGE": 1,
    "INPUT_STATE": 2,
    "ADD": 3,
    "MUL": 4,
    "EQ": 5,
    "TIME": 6,
    "MOD": 7,
    "GT": 8,
    "NOT": 9,
    "INPUT_STATE_BINARY": 10,
    "ABS": 11,
    "DUP": 12,
    "SIN": 13,
    "COS": 14,
    "DEBUG": 15,
    "AUTO_REPEAT": 16,
    "RELU": 17,
    "CLAMP": 18,
    "SCALING": 19,
    "LAYER_STATE": 20,
    "STICKY_STATE": 21,
    "TAP_STATE": 22,
    "HOLD_STATE": 23,
    "BITWISE_OR": 24,
    "BITWISE_AND": 25,
    "BITWISE_NOT": 26,
    "PREV_INPUT_STATE": 27,
    "PREV_INPUT_STATE_BINARY": 28,
    "STORE": 29,
    "RECALL": 30,
    "SQRT": 31,
    "ATAN2": 32,
    "ROUND": 33,
    "PORT": 34,
    "DPAD": 35,
    "EOL": 36,
    "INPUT_STATE_FP32": 37,
    "PREV_INPUT_STATE_FP32": 38,
    "MIN": 39,
    "MAX": 40,
    "IFTE": 41,
    "DIV": 42,
    "SWAP": 43,
    "MONITOR": 44,
    "SIGN": 45,
    "SUB": 46,
    "PRINT_IF": 47,
    "TIME_SEC": 48,
    "LT": 49,
    "PLUGGED_IN": 50,
    "INPUT_STATE_SCALED": 51,
    "PREV_INPUT_STATE_SCALED": 52,
    "DEADZONE": 53,
    "DEADZONE2": 54,
};

const opcodes = Object.fromEntries(Object.entries(ops).map(([key, value]) => [value, key]));

const expr_re = /((?:\/\*.*?\*\/)?)((?:(?!\/\*).)*)/gs;

const UINT8 = Symbol('uint8');
const UINT16 = Symbol('uint16');
const UINT32 = Symbol('uint32');
const INT32 = Symbol('int32');

let device = null;
let source_modal = null;
let target_modal = null;
let extra_usages = { 'source': [], 'target': [] };
let config = {
    'version': CONFIG_VERSION,
    'unmapped_passthrough_layers': [0, 1, 2, 3, 4, 5, 6, 7],
    'partial_scroll_timeout': DEFAULT_PARTIAL_SCROLL_TIMEOUT,
    'tap_hold_threshold': DEFAULT_TAP_HOLD_THRESHOLD,
    'gpio_debounce_time_ms': DEFAULT_GPIO_DEBOUNCE_TIME,
    'interval_override': 0,
    'our_descriptor_number': 0,
    'ignore_auth_dev_inputs': false,
    'macro_entry_duration': DEFAULT_MACRO_ENTRY_DURATION,
    'gpio_output_mode': 0,
    'input_labels': 0,
    'normalize_gamepad_inputs': true,
    mappings: [{
        'source_usage': '0x00000000',
        'target_usage': '0x00000000',
        'layers': [0],
        'sticky': false,
        'tap': false,
        'hold': false,
        'scaling': DEFAULT_SCALING,
        'source_port': 0,
        'target_port': 0,
    }],
    macros: [
        [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [],
        [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []
    ],
    expressions: [
        '', '', '', '', '', '', '', ''
    ],
    quirks: [],
};
let monitor_enabled = false;
let monitor_min_val = {};
let monitor_max_val = {};
let unique_id_counter = 0;
let save_to_device_checkmark_timeout_id = null;
let busy = false;
let paired_devices_supported = true;
let paired_devices_timer = null;
let bt_events_supported = true;
let bt_scanning = false;
// set once the firmware confirms the scan we asked for started, so that older
// "stopped scanning" events in the log don't turn our scan off
let bt_scan_confirmed = false;
// the first read gets the firmware's past events; we show them but don't act on them
let bt_history_loaded = false;
let bt_tick_count = 0;
let bt_next_event_seq = 0;
let bt_scan_results = [];
let bt_paired_devices = [];
let bt_known_names = {};
let bt_connect_pending = null;  // address string while a connection attempt is in progress
let bt_connect_pending_since = 0;
const ignored_usages = new Set([
]);
let modal_return_mapping = null;
let modal_return_element = null;

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("open_device").addEventListener("click", open_device);
    document.getElementById("load_from_device").addEventListener("click", load_from_device);
    document.getElementById("save_to_device").addEventListener("click", save_to_device);
    document.getElementById("add_mapping").addEventListener("click", add_mapping_onclick);
    document.getElementById("download_json").addEventListener("click", download_json);
    document.getElementById("upload_json").addEventListener("click", upload_json);
    document.getElementById("flash_firmware").addEventListener("click", flash_firmware);
    document.getElementById("flash_b_side").addEventListener("click", flash_b_side);
    document.getElementById("clear_bonds").addEventListener("click", clear_bonds);
    document.getElementById("bt_scan_toggle").addEventListener("click", bt_scan_toggle);
    document.getElementById("bt_scan_hid_only").addEventListener("change", render_scan_results);
    document.getElementById("monitor_clear").addEventListener("click", monitor_clear);
    document.getElementById("file_input").addEventListener("change", file_uploaded);
    document.getElementById("add_quirk").addEventListener("click", add_empty_quirk);

    device_buttons_set_disabled_state(true);

    document.getElementById("partial_scroll_timeout_input").addEventListener("change", partial_scroll_timeout_onchange);
    document.getElementById("tap_hold_threshold_input").addEventListener("change", tap_hold_threshold_onchange);
    document.getElementById("gpio_debounce_time_input").addEventListener("change", gpio_debounce_time_onchange);
    document.getElementById("macro_entry_duration_input").addEventListener("change", macro_entry_duration_onchange);
    for (let i = 0; i < NLAYERS; i++) {
        document.getElementById("unmapped_passthrough_checkbox" + i).addEventListener("change", unmapped_passthrough_onchange);
    }
    document.getElementById("interval_override_dropdown").addEventListener("change", interval_override_onchange);
    document.getElementById("our_descriptor_number_dropdown").addEventListener("change", our_descriptor_number_onchange);
    document.getElementById("gpio_output_mode_dropdown").addEventListener("change", gpio_output_mode_onchange);
    document.getElementById("input_labels_dropdown").addEventListener("change", input_labels_onchange("input_labels_dropdown"));
    document.getElementById("input_labels_modal_dropdown").addEventListener("change", input_labels_onchange("input_labels_modal_dropdown"));
    document.getElementById("ignore_auth_dev_inputs_checkbox").addEventListener("change", ignore_auth_dev_inputs_onchange);
    document.getElementById("normalize_gamepad_inputs_checkbox").addEventListener("change", normalize_gamepad_inputs_onchange);

    document.getElementById("nav-monitor-tab").addEventListener("shown.bs.tab", monitor_tab_shown);
    document.getElementById("nav-monitor-tab").addEventListener("hide.bs.tab", monitor_tab_hide);
    document.getElementById("nav-actions-tab").addEventListener("shown.bs.tab", actions_tab_shown);
    document.getElementById("nav-actions-tab").addEventListener("hide.bs.tab", actions_tab_hide);

    document.getElementById("input-column-header").addEventListener("click", sort_by(['source_port', 'source_usage', 'target_usage', 'layers']));
    document.getElementById("output-column-header").addEventListener("click", sort_by(['target_usage', 'source_port', 'source_usage', 'layers']));
    document.getElementById("layer-column-header").addEventListener("click", sort_by(['layers', 'source_port', 'source_usage', 'target_usage']));

    if ("hid" in navigator) {
        navigator.hid.addEventListener('disconnect', hid_on_disconnect);
    } else {
        display_error("Your browser doesn't support WebHID. Try Chrome (desktop version) or a Chrome-based browser.");
    }

    setup_examples();
    source_modal = new bootstrap.Modal(document.getElementById('source_usage_modal'), {});
    target_modal = new bootstrap.Modal(document.getElementById('target_usage_modal'), {});
    setup_macros();
    setup_expressions();
    set_ui_state();
});

async function open_device() {
    if (busy) {
        return;
    }
    busy = true;

    clear_error();
    let success = false;

    try {
        const devices = await navigator.hid.requestDevice({
            filters: [{ usagePage: 0xFF00, usage: 0x0020 }]
        });
        const config_interface = devices?.find(d => d.collections.some(c => c.usagePage == 0xff00));
        if (config_interface !== undefined) {
            device = config_interface;
            if (!device.opened) {
                await device.open().catch((err) => { display_error(err + "\nIf you're on Linux, you might need to give yourself permissions to the appropriate /dev/hidraw* device."); });
            }
            success = device.opened;
            success &&= await check_device_version();
            if (success) {
                device.addEventListener('inputreport', input_report_received);
                await set_monitor_enabled(monitor_enabled);
                await get_usages_from_device();
                setup_usages_modals();
                bluetooth_buttons_set_visibility(device.productName.includes("Bluetooth"));
                paired_devices_supported = true;
                bt_events_supported = true;
                bt_scanning = false;
                bt_next_event_seq = 0;
                bt_history_loaded = false;
                document.getElementById("bt_event_log").replaceChildren();
            }
        }
    } catch (e) {
        display_error(e);
    }

    device_buttons_set_disabled_state(!success);

    if (!success) {
        device = null;
    }

    busy = false;
}

async function load_from_device() {
    if (device == null) {
        return;
    }

    if (busy) {
        return;
    }
    busy = true;

    clear_error();

    document.getElementById('load_from_device').disabled = true;

    try {
        await send_feature_command(GET_CONFIG);
        const [config_version, flags, unmapped_passthrough_layer_mask, partial_scroll_timeout, mapping_count, our_usage_count, their_usage_count, interval_override, tap_hold_threshold, gpio_debounce_time_ms, our_descriptor_number, macro_entry_duration, quirk_count] =
            await read_config_feature([UINT8, UINT8, UINT8, UINT32, UINT16, UINT32, UINT32, UINT8, UINT32, UINT8, UINT8, UINT8, UINT16]);
        check_received_version(config_version);

        config['version'] = config_version;
        config['unmapped_passthrough_layers'] = mask_to_layer_list(unmapped_passthrough_layer_mask);
        config['partial_scroll_timeout'] = partial_scroll_timeout;
        config['tap_hold_threshold'] = tap_hold_threshold;
        config['gpio_debounce_time_ms'] = gpio_debounce_time_ms;
        config['interval_override'] = interval_override;
        config['our_descriptor_number'] = our_descriptor_number;
        config['ignore_auth_dev_inputs'] = !!(flags & IGNORE_AUTH_DEV_INPUTS_FLAG);
        config['gpio_output_mode'] = (flags & GPIO_OUTPUT_MODE_FLAG) ? 1 : 0;
        config['normalize_gamepad_inputs'] = !!(flags & NORMALIZE_GAMEPAD_INPUTS_FLAG);
        config['macro_entry_duration'] = macro_entry_duration + 1;
        config['mappings'] = [];

        for (let i = 0; i < mapping_count; i++) {
            await send_feature_command(GET_MAPPING, [[UINT32, i]]);
            const [target_usage, source_usage, scaling, layer_mask, mapping_flags, hub_ports] =
                await read_config_feature([UINT32, UINT32, INT32, UINT8, UINT8, UINT8]);
            config['mappings'].push({
                'target_usage': '0x' + target_usage.toString(16).padStart(8, '0'),
                'source_usage': '0x' + source_usage.toString(16).padStart(8, '0'),
                'scaling': scaling,
                'layers': mask_to_layer_list(layer_mask),
                'sticky': (mapping_flags & STICKY_FLAG) != 0,
                'tap': (mapping_flags & TAP_FLAG) != 0,
                'hold': (mapping_flags & HOLD_FLAG) != 0,
                'source_port': hub_ports & 0x0F,
                'target_port': (hub_ports >> 4) & 0x0F,
            });
        }

        config['macros'] = [];

        for (let macro_i = 0; macro_i < NMACROS; macro_i++) {
            let macro = [];
            let i = 0;
            let keep_going = true;
            while (keep_going) {
                await send_feature_command(GET_MACRO, [[UINT32, macro_i], [UINT32, i]]);
                const fields = await read_config_feature([UINT8, UINT32, UINT32, UINT32, UINT32, UINT32, UINT32]);
                const nitems = fields[0];
                const usages_ = fields.slice(1);
                if (nitems < MACRO_ITEMS_IN_PACKET) {
                    keep_going = false;
                }
                if ((macro.length == 0) && (nitems > 0)) {
                    macro = [[]];
                }
                for (const usage of usages_.slice(0, nitems)) {
                    if (usage == 0) {
                        macro.push([]);
                    } else {
                        macro.at(-1).push('0x' + usage.toString(16).padStart(8, '0'));
                    }
                }
                i += MACRO_ITEMS_IN_PACKET;
            }

            config['macros'].push(macro);
        }

        config['expressions'] = [];

        for (let expr_i = 0; expr_i < NEXPRESSIONS; expr_i++) {
            let expression = [];
            let i = 0;
            while (true) {
                await send_feature_command(GET_EXPRESSION, [[UINT32, expr_i], [UINT32, i]]);
                const fields = await read_config_feature([UINT8, UINT8, UINT8, UINT8, UINT8, UINT8, UINT8, UINT8, UINT8, UINT8, UINT8, UINT8, UINT8, UINT8, UINT8, UINT8, UINT8, UINT8, UINT8, UINT8, UINT8, UINT8, UINT8, UINT8, UINT8, UINT8, UINT8, UINT8]);
                const nelems = fields[0];
                if (nelems == 0) {
                    break;
                }
                let elems = fields.slice(1);
                for (let j = 0; j < nelems; j++) {
                    const elem = elems[0];
                    elems = elems.slice(1);
                    if ([ops['PUSH'], ops['PUSH_USAGE']].includes(elem)) {
                        const val = elems[3] << 24 | elems[2] << 16 | elems[1] << 8 | elems[0];
                        elems = elems.slice(4);
                        if (elem == ops['PUSH']) {
                            expression.push(val.toString());
                        } else {
                            expression.push('0x' + (val >>> 0).toString(16).padStart(8, '0'));
                        }
                    } else {
                        expression.push(opcodes[elem].toLowerCase());
                    }
                }
                i += nelems;
            }

            config['expressions'].push(expression.join(' '));
        }

        config['quirks'] = [];

        for (let quirk_i = 0; quirk_i < quirk_count; quirk_i++) {
            await send_feature_command(GET_QUIRK, [[UINT32, quirk_i]]);
            const [vendor_id, product_id, interface_, report_id, usage, bitpos, size_flags] =
                await read_config_feature([UINT16, UINT16, UINT8, UINT8, UINT32, UINT16, UINT8]);
            config['quirks'].push({
                'vendor_id': '0x' + vendor_id.toString(16).padStart(4, '0'),
                'product_id': '0x' + product_id.toString(16).padStart(4, '0'),
                'interface': interface_,
                'report_id': report_id,
                'usage': '0x' + usage.toString(16).padStart(8, '0'),
                'bitpos': bitpos,
                'size': size_flags & QUIRK_SIZE_MASK,
                'relative': (size_flags & QUIRK_FLAG_RELATIVE_MASK) != 0,
                'signed': (size_flags & QUIRK_FLAG_SIGNED_MASK) != 0,
            });
        }

        set_ui_state();
        validate_ui_expressions();
    } catch (e) {
        display_error(e);
    }

    if (device != null) {
        document.getElementById('load_from_device').disabled = false;
    }

    busy = false;
}

async function save_to_device() {
    if (device == null) {
        return;
    }

    if (busy) {
        return;
    }
    busy = true;

    clear_error();

    document.getElementById('save_to_device').disabled = true;
    if (save_to_device_checkmark_timeout_id != null) {
        clearTimeout(save_to_device_checkmark_timeout_id);
    }
    document.getElementById('save_to_device_checkmark').classList.add('d-none');

    try {
        await send_feature_command(SUSPEND);
        const flags = (config['ignore_auth_dev_inputs'] ? IGNORE_AUTH_DEV_INPUTS_FLAG : 0) |
            (config['gpio_output_mode'] ? GPIO_OUTPUT_MODE_FLAG : 0) |
            (config['normalize_gamepad_inputs'] ? NORMALIZE_GAMEPAD_INPUTS_FLAG : 0);
        await send_feature_command(SET_CONFIG, [
            [UINT8, flags],
            [UINT8, layer_list_to_mask(config['unmapped_passthrough_layers'])],
            [UINT32, config['partial_scroll_timeout']],
            [UINT8, config['interval_override']],
            [UINT32, config['tap_hold_threshold']],
            [UINT8, config['gpio_debounce_time_ms']],
            [UINT8, config['our_descriptor_number']],
            [UINT8, config['macro_entry_duration'] - 1],
        ]);
        await send_feature_command(CLEAR_MAPPING);

        for (const mapping of config['mappings']) {
            await send_feature_command(ADD_MAPPING, [
                [UINT32, parseInt(mapping['target_usage'], 16)],
                [UINT32, parseInt(mapping['source_usage'], 16)],
                [INT32, mapping['scaling']],
                [UINT8, layer_list_to_mask(mapping['layers'])],
                [UINT8, (mapping['sticky'] ? STICKY_FLAG : 0)
                    | (mapping['tap'] ? TAP_FLAG : 0)
                    | (mapping['hold'] ? HOLD_FLAG : 0)],
                [UINT8, ((mapping['target_port'] & 0x0F) << 4) | (mapping['source_port'] & 0x0F)],
            ]);
        }

        await send_feature_command(CLEAR_MACROS);
        let macro_i = 0;
        for (const macro of config['macros']) {
            if (macro_i >= NMACROS) {
                break;
            }

            const flat_zero_separated = macro.map((x) => x.concat(["0x00"])).flat().slice(0, -1);

            for (let i = 0; i < flat_zero_separated.length; i += MACRO_ITEMS_IN_PACKET) {
                const chunk_size = i + MACRO_ITEMS_IN_PACKET > flat_zero_separated.length
                    ? flat_zero_separated.length - i
                    : MACRO_ITEMS_IN_PACKET;
                await send_feature_command(APPEND_TO_MACRO,
                    [[UINT8, macro_i], [UINT8, chunk_size]].concat(
                        flat_zero_separated
                            .slice(i, i + chunk_size)
                            .map((x) => [UINT32, parseInt(x, 16)])));
            }

            macro_i++;
        }

        await send_feature_command(CLEAR_EXPRESSIONS);
        let expr_i = 0;
        for (const expr of config['expressions']) {
            if (expr_i >= NEXPRESSIONS) {
                break;
            }

            let elems = expr_to_elems(expr);
            while (elems.length > 0) {
                let bytes_left = 24;
                let items_to_send = [];
                let nelems = 0;
                while ((elems.length > 0) && (bytes_left > 0)) {
                    const elem = elems[0];
                    if ([ops["PUSH"], ops["PUSH_USAGE"]].includes(elem[0])) {
                        if (bytes_left >= 5) {
                            items_to_send.push([UINT8, elem[0]]);
                            items_to_send.push([UINT32, elem[1] >>> 0]);
                            bytes_left -= 5;
                            nelems++;
                            elems = elems.slice(1);
                        } else {
                            break
                        }
                    } else {
                        items_to_send.push([UINT8, elem[0]]);
                        bytes_left--;
                        nelems++;
                        elems = elems.slice(1);
                    }
                }
                await send_feature_command(APPEND_TO_EXPRESSION,
                    [[UINT8, expr_i], [UINT8, nelems]].concat(items_to_send));
            }

            expr_i++;
        }

        await send_feature_command(CLEAR_QUIRKS);
        for (const quirk of config['quirks']) {
            const size_flags = (quirk['size'] & QUIRK_SIZE_MASK) |
                (quirk['relative'] ? QUIRK_FLAG_RELATIVE_MASK : 0) |
                (quirk['signed'] ? QUIRK_FLAG_SIGNED_MASK : 0);
            await send_feature_command(ADD_QUIRK, [
                [UINT16, parseInt(quirk['vendor_id'], 16)],
                [UINT16, parseInt(quirk['product_id'], 16)],
                [UINT8, quirk['interface']],
                [UINT8, quirk['report_id']],
                [UINT32, parseInt(quirk['usage'], 16)],
                [UINT16, quirk['bitpos']],
                [UINT8, size_flags],
            ]);
        }

        await send_feature_command(PERSIST_CONFIG);

        let [persist_config_return_code] = await read_config_feature([UINT8]);

        await send_feature_command(RESUME);

        switch (persist_config_return_code) {
            case PERSIST_CONFIG_SUCCESS:
                document.getElementById('save_to_device_checkmark').classList.remove('d-none');
                save_to_device_checkmark_timeout_id = setTimeout(() => {
                    document.getElementById('save_to_device_checkmark').classList.add('d-none');
                    save_to_device_checkmark_timeout_id = null;
                }, 3000);
                break;
            case PERSIST_CONFIG_CONFIG_TOO_BIG:
                display_error('Configuration too big to persist.');
                break;
            default:
                throw new Error('Unknown PERSIST_CONFIG return code (' + return_code + ').');
        }
    } catch (e) {
        display_error(e);
    }

    if (device != null) {
        document.getElementById('save_to_device').disabled = false;
    }

    busy = false;
}

async function do_get_usages_from_device(command, rle_count) {
    const extra_usage_set = new Set();
    let i = 0;
    while (i < rle_count) {
        await send_feature_command(command, [[UINT32, i]]);
        const fields = await read_config_feature([UINT32, UINT32, UINT32, UINT32, UINT32, UINT32]);

        for (let j = 0; j < 3; j++) {
            const usage = fields[2 * j];
            const count = fields[2 * j + 1];
            if (usage != 0) {
                for (let k = 0; k < count; k++) {
                    const u = '0x' + (usage + k).toString(16).padStart(8, '0');
                    if (!ignored_usages.has(u)) {
                        extra_usage_set.add(u);
                    }
                }
            }
        }

        i += 3;
    }

    const extra_usages_ = Array.from(extra_usage_set);
    extra_usages_.sort();
    return extra_usages_;
}

async function get_usages_from_device() {
    await send_feature_command(GET_CONFIG);
    const [config_version, flags, unmapped_passthrough_layer_mask, partial_scroll_timeout, mapping_count, our_usage_count, their_usage_count, interval_override, tap_hold_threshold, gpio_debounce_time_ms, our_descriptor_number, macro_entry_duration, quirk_count] =
        await read_config_feature([UINT8, UINT8, UINT8, UINT32, UINT16, UINT32, UINT32, UINT8, UINT32, UINT8, UINT8, UINT8, UINT16]);
    check_received_version(config_version);

    extra_usages['target'] =
        await do_get_usages_from_device(GET_OUR_USAGES, our_usage_count);
    extra_usages['source'] =
        await do_get_usages_from_device(GET_THEIR_USAGES, their_usage_count);
}

function set_config_ui_state() {
    document.getElementById('partial_scroll_timeout_input').value = Math.round(config['partial_scroll_timeout'] / 1000);
    document.getElementById('tap_hold_threshold_input').value = Math.round(config['tap_hold_threshold'] / 1000);
    document.getElementById('gpio_debounce_time_input').value = config['gpio_debounce_time_ms'];
    for (let i = 0; i < NLAYERS; i++) {
        document.getElementById('unmapped_passthrough_checkbox' + i).checked =
            config['unmapped_passthrough_layers'].includes(i);
    }
    document.getElementById('interval_override_dropdown').value = config['interval_override'];
    document.getElementById('our_descriptor_number_dropdown').value = config['our_descriptor_number'];
    document.getElementById('ignore_auth_dev_inputs_checkbox').checked = config['ignore_auth_dev_inputs'];
    document.getElementById('macro_entry_duration_input').value = config['macro_entry_duration'];
    document.getElementById('gpio_output_mode_dropdown').value = config['gpio_output_mode'];
    document.getElementById('input_labels_dropdown').value = config['input_labels'];
    document.getElementById('input_labels_modal_dropdown').value = config['input_labels'];
    document.getElementById('normalize_gamepad_inputs_checkbox').checked = config['normalize_gamepad_inputs'];
}

function set_mappings_ui_state() {
    clear_children(document.getElementById('mappings'));
    for (const mapping of config['mappings']) {
        add_mapping(mapping);
    }
}

function set_macros_ui_state() {
    let macro_i = 0;
    for (const macro of config['macros']) {
        if (macro_i >= NMACROS) {
            break;
        }

        const macro_element = document.getElementById('macro_' + macro_i);
        const macro_entries = macro_element.querySelector('.macro_entries');
        clear_children(macro_entries);
        for (const entry of macro) {
            const entry_element = add_macro_entry(macro_element);
            for (const item of entry) {
                const item_element = add_macro_item(entry_element);
                const usage_button_element = item_element.querySelector('.macro_item_usage');
                usage_button_element.querySelector('.button_label').innerText = readable_target_usage_name(item);
                usage_button_element.title = item;
                usage_button_element.setAttribute('data-hid-usage', item);
            }
            if (entry.length == 0) {
                add_macro_item(entry_element);
            }
        }

        macro_i++;
    }
    set_macro_previews();
}

function set_macro_previews() {
    for (let i = 0; i < NMACROS; i++) {
        const macro_element = document.getElementById('macro_' + i);
        const preview = Array.from(macro_element.querySelectorAll('.macro_entry'),
            (entry_element) => Array.from(entry_element.querySelectorAll('.macro_item_usage .button_label'),
                (item_element) => item_element.innerText == "Nothing" ? "∅" : item_element.innerText
            ).join('+')).join(', ');
        macro_element.querySelector('.macro_preview').innerText = preview;
    }
}

function set_expressions_ui_state() {
    const json_to_ui = function (op) {
        if (op.toLowerCase().startsWith('0x')) {
            return op;
        }
        if (/^[0-9-]/.test(op)) {
            return (parseInt(op, 10) / 1000).toString();
        }
        if (op.toLowerCase() == 'eol') {
            return '\n';
        }
        return op;
    }

    let expr_i = 0;
    for (const expr of config['expressions']) {
        if (expr_i >= NEXPRESSIONS) {
            break;
        }

        const expression_input = document.getElementById('expression_' + expr_i).querySelector('.expression_input');
        const expression_text = [...expr.matchAll(expr_re).map(x => x[1] + x[2].split(/\s+/).map(json_to_ui).join(' ').replace(/( )?\n /g, '\n'))].join('');
        expression_input.value = expression_text;

        const eols = expression_text.match(/\n/g);
        // This doesn't take wrapped lines into consideration.
        expression_input.rows = eols == null ? 1 : eols.length + 1;

        expr_i++;
    }
}

function set_ui_state() {
    if (config['version'] == 3) {
        config['unmapped_passthrough_layers'] = config['unmapped_passthrough'] ? [0] : [];
        delete config['unmapped_passthrough'];
        for (const mapping of config['mappings']) {
            mapping['layers'] = [mapping['layer']];
            delete mapping['layer'];
        }
        config['macros'] = [[], [], [], [], [], [], [], []];
    }
    if (config['version'] < 5) {
        for (const mapping of config['mappings']) {
            mapping['tap'] = false;
            mapping['hold'] = false;
        }
        config['tap_hold_threshold'] = DEFAULT_TAP_HOLD_THRESHOLD;
    }
    if (config['version'] < 6) {
        config['expressions'] = ['', '', '', '', '', '', '', ''];
    }
    if (config['version'] < 7) {
        while (config['macros'].length < NMACROS) {
            config['macros'].push([]);
        }
        config['gpio_debounce_time_ms'] = DEFAULT_GPIO_DEBOUNCE_TIME;
    }
    if (config['version'] < 9) {
        config['our_descriptor_number'] = 0;
        config['ignore_auth_dev_inputs'] = false;
    }
    if (config['version'] < 10) {
        config['macro_entry_duration'] = DEFAULT_MACRO_ENTRY_DURATION;
        config['gpio_output_mode'] = 0;
    }
    if (config['version'] < 11) {
        for (const mapping of config['mappings']) {
            mapping['source_port'] = 0;
            mapping['target_port'] = 0;
        }
    }
    if (config['version'] < 12) {
        config['quirks'] = [];
    }
    if (config['version'] < 16) {
        config['input_labels'] = 0;
    }
    if (config['version'] < 18) {
        // Normalize gamepad inputs defaults to true, but if we're loading a <18 config,
        // set it to false to preserve previous behavior.
        config['normalize_gamepad_inputs'] = false;
    }
    if (config['version'] < CONFIG_VERSION) {
        config['version'] = CONFIG_VERSION;
    }

    set_config_ui_state();
    set_mappings_ui_state();
    set_macros_ui_state();
    set_expressions_ui_state();
    set_quirks_ui_state();
    setup_usages_modals();
}

function set_port_badge(button_element, port) {
    const port_badge = button_element.querySelector('.hub_port_badge');
    port_badge.innerText = port;
    if (port == 0) {
        port_badge.classList.add('d-none');
    } else {
        port_badge.classList.remove('d-none');
    }
}

function add_mapping(mapping) {
    const template = document.getElementById("mapping_template");
    const container = document.getElementById("mappings");
    const clone = template.content.cloneNode(true).firstElementChild;
    clone.querySelector(".delete_button").addEventListener("click", delete_mapping(mapping, clone));
    const sticky_checkbox = clone.querySelector(".sticky_checkbox");
    sticky_checkbox.checked = mapping['sticky'];
    sticky_checkbox.addEventListener("change", sticky_onclick(mapping, sticky_checkbox));
    const tap_checkbox = clone.querySelector(".tap_checkbox");
    tap_checkbox.checked = mapping['tap'];
    tap_checkbox.addEventListener("change", tap_onclick(mapping, tap_checkbox));
    const hold_checkbox = clone.querySelector(".hold_checkbox");
    hold_checkbox.checked = mapping['hold'];
    hold_checkbox.addEventListener("change", hold_onclick(mapping, hold_checkbox));
    const scaling_input = clone.querySelector(".scaling_input");
    scaling_input.value = mapping['scaling'] / 1000;
    scaling_input.addEventListener("input", scaling_onchange(mapping, scaling_input));
    for (let i = 0; i < NLAYERS; i++) {
        const layer_checkbox = clone.querySelector(".layer_checkbox" + i);
        layer_checkbox.checked = mapping['layers'].includes(i);
        layer_checkbox.addEventListener("change", layer_checkbox_onchange(mapping, layer_checkbox, i));
    }
    const source_button = clone.querySelector(".source_button");
    source_button.querySelector('.button_label').innerText =
        'source_name' in mapping ? mapping['source_name'] : readable_usage_name(mapping['source_usage']);
    source_button.setAttribute('data-hid-usage', mapping['source_usage']);
    source_button.title = mapping['source_usage'];
    source_button.addEventListener("click", show_usage_modal(mapping, 'source', clone));
    set_port_badge(source_button, mapping['source_port']);
    const target_button = clone.querySelector(".target_button");
    target_button.querySelector('.button_label').innerText = readable_target_usage_name(mapping['target_usage']);
    target_button.setAttribute('data-hid-usage', mapping['target_usage']);
    target_button.title = mapping['target_usage'];
    target_button.addEventListener("click", show_usage_modal(mapping, 'target', clone));
    set_port_badge(target_button, mapping['target_port']);
    container.appendChild(clone);
    set_forced_layers(mapping, clone);
    set_forced_flags(mapping, clone);
    if (modal_return_mapping === mapping) {
        modal_return_element = clone;
    }
}

function download_json() {
    clear_error();
    let element = document.createElement('a');
    element.setAttribute('href', 'data:application/json,' + encodeURIComponent(JSON.stringify(config, null, 4)));
    element.setAttribute('download', 'hid-remapper-config.json');

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function upload_json() {
    clear_error();
    document.getElementById("file_input").click();
}

async function flash_firmware() {
    display_error("HID Remapper should now be in firmware flashing mode. Copy UF2 file to the drive that appeared. If you don't want to flash new firmware at this time, just unplug and replug the device.");
    await send_feature_command(RESET_INTO_BOOTSEL);
}

async function flash_b_side() {
    display_error("Side B should now be flashed with firmware version matching side A. Disconnect and reconnect the device.");
    await send_feature_command(FLASH_B_SIDE);
}

async function clear_bonds() {
    await with_device_lock(() => send_feature_command(CLEAR_BONDS));
    // the firmware does the unpairing asynchronously
    setTimeout(refresh_paired_devices, 1500);
}

// Waits for any other device communication to finish, so that our command
// and its response don't get interleaved with someone else's.
async function with_device_lock(fn) {
    while (busy) {
        await new Promise(resolve => setTimeout(resolve, 20));
    }
    if (device == null) {
        return;
    }
    busy = true;
    try {
        return await fn();
    } catch (e) {
        display_error(e);
    } finally {
        busy = false;
    }
}

function is_bluetooth_device() {
    return (device != null) && device.productName.includes("Bluetooth");
}

function actions_tab_shown() {
    bt_tick();
    if (paired_devices_timer == null) {
        paired_devices_timer = setInterval(bt_tick, 1000);
    }
}

async function actions_tab_hide() {
    if (paired_devices_timer != null) {
        clearInterval(paired_devices_timer);
        paired_devices_timer = null;
    }
    if (bt_scanning) {
        bt_scanning = false;
        await with_device_lock(() => send_feature_command(SET_WEB_SCAN, [[UINT8, 0]]));
        update_scan_button();
    }
}

function format_bt_address(addr_bytes) {
    // stored little-endian, displayed most significant byte first
    return addr_bytes.slice().reverse().map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(':');
}

function bytes_to_string(bytes) {
    let s = '';
    for (const b of bytes) {
        if (b == 0) {
            break;
        }
        s += String.fromCharCode(b);
    }
    // names are UTF-8
    try {
        s = decodeURIComponent(escape(s));
    } catch (e) {
    }
    return s;
}

async function read_packet(command, index) {
    await send_feature_command(command, [[UINT32, index]]);
    return await read_config_feature(new Array(CONFIG_SIZE - 4).fill(UINT8));
}

function int32_from_bytes(bytes) {
    return new DataView(new Uint8Array(bytes).buffer).getInt32(0, true);
}

function uint32_from_bytes(bytes) {
    return new DataView(new Uint8Array(bytes).buffer).getUint32(0, true);
}

async function read_paired_devices() {
    let devices = [];
    for (let i = 0; i < MAX_PAIRED_DEVICES; i++) {
        const bytes = await read_packet(GET_PAIRED_DEVICE, i);
        const [valid, connected, addr_type] = bytes;
        if (!valid) {
            break;
        }
        devices.push({ connected: !!connected, addr_type: addr_type, addr: bytes.slice(3, 9), name: bytes_to_string(bytes.slice(9)) });
    }
    return devices;
}

async function read_scan_results() {
    let results = [];
    for (let i = 0; i < SCAN_RESULTS_MAX; i++) {
        const bytes = await read_packet(GET_SCAN_RESULT, i);
        if (!bytes[0]) {
            break;
        }
        results.push({
            addr_type: bytes[1],
            addr: bytes.slice(2, 8),
            rssi: (bytes[8] << 24) >> 24,
            flags: bytes[9],
            appearance: bytes[10] | (bytes[11] << 8),
            name: bytes_to_string(bytes.slice(12)),
        });
    }
    return results;
}

async function read_new_events() {
    let events = [];
    for (let i = 0; i < 32; i++) {
        const bytes = await read_packet(GET_BT_EVENT, bt_next_event_seq);
        const seq = uint32_from_bytes(bytes.slice(0, 4));
        if (seq == 0) {
            break;
        }
        events.push({
            seq: seq,
            time_ms: uint32_from_bytes(bytes.slice(4, 8)),
            type: bytes[8],
            addr_type: bytes[9],
            addr: bytes.slice(10, 16),
            value: int32_from_bytes(bytes.slice(16, 20)),
        });
        bt_next_event_seq = seq + 1;
    }
    return events;
}

// Called every second while the Actions tab is open.
async function bt_tick() {
    if (!is_bluetooth_device() || busy) {
        return;
    }
    busy = true;
    bt_tick_count++;
    let events = [];
    let paired_changed = false;
    let scan_changed = false;
    let history_read_ok = false;
    try {
        if (bt_events_supported) {
            try {
                if (bt_scanning) {
                    // also keeps the scan going; the firmware stops it if we stop asking
                    await send_feature_command(SET_WEB_SCAN, [[UINT8, 1]]);
                    bt_scan_results = await read_scan_results();
                    scan_changed = true;
                }
                events = await read_new_events();
                history_read_ok = true;
            } catch (e) {
                // firmware from before this feature doesn't answer these
                bt_events_supported = false;
                bt_scanning = false;
            }
        }
        if (paired_devices_supported && ((bt_tick_count % 3 == 1) || (events.length > 0))) {
            try {
                bt_paired_devices = await read_paired_devices();
                paired_changed = true;
            } catch (e) {
                paired_devices_supported = false;
                paired_changed = true;
            }
        }
    } finally {
        busy = false;
    }

    for (const d of bt_scan_results.concat(bt_paired_devices)) {
        if (d.name) {
            bt_known_names[format_bt_address(d.addr)] = d.name;
        }
    }
    const live = bt_history_loaded;
    if (bt_events_supported && history_read_ok) {
        bt_history_loaded = true;
    }
    if (!live && events.length > 0) {
        add_log_line("(earlier activity; times are seconds since the remapper started)", "secondary");
    }
    for (const e of events) {
        handle_bt_event(e, live);
    }
    if ((bt_connect_pending != null) && (Date.now() - bt_connect_pending_since > 60000)) {
        bt_connect_pending = null;
    }
    if (paired_changed) {
        render_paired_devices(paired_devices_supported ? bt_paired_devices : null);
    }
    if (scan_changed || events.length > 0) {
        render_scan_results();
    }
    render_scan_section();
}

async function refresh_paired_devices() {
    bt_tick_count = 0;  // makes the next tick read the paired devices
    await bt_tick();
}

function render_paired_devices(devices) {
    const container = document.getElementById("paired_devices_container");
    const list = document.getElementById("paired_devices_list");
    const status = document.getElementById("paired_devices_status");
    container.classList.remove("d-none");
    list.replaceChildren();

    if (devices == null) {
        status.innerText = "The firmware on this device can't list paired devices. Flash the latest firmware to see them here.";
        return;
    }
    if (devices.length == 0) {
        status.innerText = "No paired devices. Use \"Scan for devices\" below to pair one.";
        return;
    }
    status.innerText = "Updates every few seconds while this tab is open.";

    const template = document.getElementById("paired_device_template");
    for (const d of devices) {
        const element = template.content.cloneNode(true).firstElementChild;
        // textContent, not innerHTML: the name comes from the Bluetooth device
        element.querySelector(".paired_device_name").textContent = d.name || "Unnamed device";
        element.querySelector(".paired_device_address").textContent =
            format_bt_address(d.addr) + (d.addr_type == 0 ? " (public)" : " (random)");
        const badge = element.querySelector(".paired_device_connected");
        badge.textContent = d.connected ? "Connected" : "Not connected";
        badge.classList.add(d.connected ? "text-bg-success" : "text-bg-secondary");
        element.querySelector(".paired_device_forget").addEventListener("click", () => forget_device(d));
        list.appendChild(element);
    }
}

async function forget_device(d) {
    if (!confirm(`Forget ${d.name || format_bt_address(d.addr)}? You'll have to pair it again to use it.`)) {
        return;
    }
    await with_device_lock(() => send_feature_command(FORGET_DEVICE, [[UINT8, d.addr_type], ...d.addr.map(b => [UINT8, b])]));
    // the firmware does the unpairing asynchronously
    setTimeout(refresh_paired_devices, 1500);
}

function update_scan_button() {
    const button = document.getElementById("bt_scan_toggle");
    button.textContent = bt_scanning ? "Stop scanning" : "Scan for devices";
    button.classList.toggle("btn-primary", !bt_scanning);
    button.classList.toggle("btn-outline-secondary", bt_scanning);
}

async function bt_scan_toggle() {
    bt_scanning = !bt_scanning;
    bt_scan_confirmed = false;
    if (bt_scanning) {
        bt_scan_results = [];
        render_scan_results();
    }
    update_scan_button();
    await with_device_lock(() => send_feature_command(SET_WEB_SCAN, [[UINT8, bt_scanning ? 1 : 0]]));
    bt_tick();
}

async function bt_connect(r) {
    bt_connect_pending = format_bt_address(r.addr);
    bt_connect_pending_since = Date.now();
    render_scan_results();
    await with_device_lock(() => send_feature_command(CONNECT_DEVICE, [[UINT8, r.addr_type], ...r.addr.map(b => [UINT8, b])]));
    bt_tick();
}

function is_input_device(r) {
    // HID service advertised, or appearance in the "Human Interface Device" category (0x03C0-0x03FF)
    return (r.flags & (SCAN_RESULT_FLAG_HID_IN_ADV | SCAN_RESULT_FLAG_HID_IN_SCAN_RSP)) || ((r.appearance >> 6) == 0x0F);
}

function add_badge(container, text, style, title = '') {
    const badge = document.createElement("span");
    badge.className = "badge me-1 " + style;
    badge.textContent = text;
    if (title) {
        badge.title = title;
    }
    container.appendChild(badge);
}

function render_scan_section() {
    const container = document.getElementById("bt_scan_container");
    container.classList.toggle("d-none", !is_bluetooth_device());
    const supported = bt_events_supported;
    document.getElementById("bt_scan_toggle").disabled = !supported || (device == null) || !bt_history_loaded;
    if (!supported) {
        document.getElementById("bt_scan_status").textContent = "The firmware on this device doesn't support scanning from here. Flash the latest firmware.";
    }
    update_scan_button();
}

function render_scan_results() {
    const list = document.getElementById("bt_scan_list");
    list.replaceChildren();
    if (!bt_scanning && bt_scan_results.length == 0) {
        return;
    }
    const hid_only = document.getElementById("bt_scan_hid_only").checked;
    const shown = bt_scan_results.filter(r => !hid_only || is_input_device(r)).sort((a, b) => b.rssi - a.rssi);
    const hidden_count = bt_scan_results.length - shown.length;

    if (shown.length == 0) {
        const li = document.createElement("li");
        li.className = "list-group-item text-muted";
        li.textContent = bt_scanning ? "Scanning… nothing found yet." : "Nothing found.";
        if (hidden_count > 0) {
            li.textContent += ` (${hidden_count} other device${hidden_count == 1 ? "" : "s"} hidden.)`;
        }
        list.appendChild(li);
        return;
    }

    const template = document.getElementById("bt_scan_result_template");
    for (const r of shown) {
        const addr = format_bt_address(r.addr);
        const element = template.content.cloneNode(true).firstElementChild;
        element.querySelector(".bt_scan_name").textContent = r.name || "Unnamed device";
        element.querySelector(".bt_scan_details").textContent = `${addr}  ${r.rssi} dBm`;

        const badges = element.querySelector(".bt_scan_badges");
        let notes = [];
        if (r.flags & SCAN_RESULT_FLAG_CONNECTED) {
            add_badge(badges, "Connected", "text-bg-success");
        } else if (r.flags & SCAN_RESULT_FLAG_PAIRED) {
            add_badge(badges, "Paired", "text-bg-info");
        }
        if (r.flags & SCAN_RESULT_FLAG_HID_IN_ADV) {
            add_badge(badges, "Input device", "text-bg-primary");
        } else if (r.flags & SCAN_RESULT_FLAG_HID_IN_SCAN_RSP) {
            add_badge(badges, "Input device", "text-bg-warning");
            notes.push("Only says it's an input device when asked for details, so the remapper's normal pairing mode (button or \"Pair new device\") can't find it. Connect from here instead.");
        } else if (is_input_device(r)) {
            add_badge(badges, "Input device?", "text-bg-secondary");
            notes.push("Looks like an input device but doesn't advertise the HID service. It may not be in pairing mode yet.");
        }
        if (!(r.flags & SCAN_RESULT_FLAG_CONNECTABLE)) {
            add_badge(badges, "Not connectable", "text-bg-secondary");
            notes.push("Not accepting connections right now. Put it in pairing mode.");
        }
        element.querySelector(".bt_scan_note").textContent = notes.join(" ");

        const button = element.querySelector(".bt_scan_connect");
        const connecting = bt_connect_pending == addr;
        button.textContent = connecting ? "Connecting…" : "Connect";
        button.disabled = (bt_connect_pending != null) || !(r.flags & SCAN_RESULT_FLAG_CONNECTABLE) || !!(r.flags & SCAN_RESULT_FLAG_CONNECTED);
        button.addEventListener("click", () => bt_connect(r));
        list.appendChild(element);
    }
    if (hidden_count > 0) {
        const li = document.createElement("li");
        li.className = "list-group-item text-muted small";
        li.textContent = `${hidden_count} other device${hidden_count == 1 ? "" : "s"} hidden.`;
        list.appendChild(li);
    }
}

function hci_reason(code) {
    if (code < 0) {
        return `error ${code}`;
    }
    const hex = "0x" + code.toString(16).padStart(2, '0').toUpperCase();
    return (HCI_REASONS[code] || "error") + ` (${hex})`;
}

function security_reason(code) {
    return (SECURITY_ERRORS[code] || "error") + ` (${code})`;
}

// returns [text, style] where style is "", "success" or "danger"
function describe_bt_event(e) {
    const addr = format_bt_address(e.addr);
    const who = bt_known_names[addr] ? `${bt_known_names[addr]} (${addr})` : addr;
    switch (e.type) {
        case BT_EVENT.WEB_SCAN_STARTED: return ["Started scanning.", ""];
        case BT_EVENT.WEB_SCAN_ENDED: return [e.value ? "Stopped scanning (the config tool stopped checking in)." : "Stopped scanning.", ""];
        case BT_EVENT.CONNECTING: return [`Connecting to ${who}…`, ""];
        case BT_EVENT.CONNECT_FAILED: return [`Couldn't connect to ${who}: ${hci_reason(e.value)}.`, "danger"];
        case BT_EVENT.CONNECTED: return [`Connected to ${who}. Securing the connection…`, ""];
        case BT_EVENT.SECURITY_CHANGED: return [`Connection to ${who} is encrypted (security level ${e.value}). Setting up input…`, ""];
        case BT_EVENT.SECURITY_FAILED: return [`Couldn't secure the connection to ${who}: ${security_reason(e.value)}.`, "danger"];
        case BT_EVENT.PASSKEY_DISPLAY: return [`${who} wants a passkey: type ${String(e.value).padStart(6, '0')} on it and press Enter.`, ""];
        case BT_EVENT.PAIRING_CANCELLED: return [`Pairing with ${who} was cancelled.`, "danger"];
        case BT_EVENT.PAIRING_COMPLETE: return [e.value ? `Paired with ${who}.` : `Paired with ${who}, but it didn't allow saving the pairing; it will need to pair again next time.`, e.value ? "success" : "danger"];
        case BT_EVENT.PAIRING_FAILED: return [`Pairing with ${who} failed: ${security_reason(e.value)}.`, "danger"];
        case BT_EVENT.HID_SETUP_FAILED: return [e.value == -1 ? `${who} doesn't offer a HID (input device) service, so the remapper can't use it.` : `Setting up ${who} as an input device failed (error ${e.value}).`, "danger"];
        case BT_EVENT.READY: return [`${who} is ready. Its input now goes through the remapper.`, "success"];
        case BT_EVENT.DISCONNECTED: return [`${who} disconnected: ${hci_reason(e.value)}.`, ""];
        case BT_EVENT.FORGOTTEN: return [`Forgot ${who}.`, ""];
        case BT_EVENT.ALL_FORGOTTEN: return ["Forgot all devices.", ""];
        case BT_EVENT.CONN_PARAMS_UPDATED: return [`Connection interval for ${who} is now ${(e.value * 1.25).toFixed(2).replace(/\.?0+$/, '')} ms.`, ""];
        default: return [`Unknown event ${e.type} for ${who} (value ${e.value}).`, ""];
    }
}

function handle_bt_event(e, live) {
    const [text, style] = describe_bt_event(e);
    const seconds = (e.time_ms / 1000).toFixed(1).padStart(7, '\u00a0');
    add_log_line(`[${seconds}s] ${text}`, style);
    if (live) {
        act_on_bt_event(e);
    }
}

function add_log_line(text, style) {
    const log = document.getElementById("bt_event_log");
    const line = document.createElement("div");
    if (style) {
        line.className = "text-" + style;
    }
    line.textContent = text;
    const at_bottom = log.scrollTop + log.clientHeight >= log.scrollHeight - 4;
    log.appendChild(line);
    while (log.childElementCount > 200) {
        log.firstElementChild.remove();
    }
    if (at_bottom) {
        log.scrollTop = log.scrollHeight;
    }
}

function act_on_bt_event(e) {
    const addr = format_bt_address(e.addr);
    const passkey = document.getElementById("bt_passkey");
    if (e.type == BT_EVENT.PASSKEY_DISPLAY) {
        passkey.replaceChildren();
        passkey.append(`${bt_known_names[addr] || addr} wants a passkey. Type `);
        const code = document.createElement("strong");
        code.className = "fs-4 font-monospace";
        code.textContent = String(e.value).padStart(6, '0');
        passkey.append(code, " on it, then press Enter.");
        passkey.classList.remove("d-none");
    } else if ([BT_EVENT.PAIRING_COMPLETE, BT_EVENT.PAIRING_FAILED, BT_EVENT.PAIRING_CANCELLED, BT_EVENT.SECURITY_FAILED,
                BT_EVENT.SECURITY_CHANGED, BT_EVENT.DISCONNECTED, BT_EVENT.WEB_SCAN_ENDED].includes(e.type)) {
        passkey.classList.add("d-none");
    }

    if ([BT_EVENT.CONNECT_FAILED, BT_EVENT.SECURITY_FAILED, BT_EVENT.PAIRING_FAILED, BT_EVENT.PAIRING_CANCELLED,
         BT_EVENT.HID_SETUP_FAILED, BT_EVENT.READY, BT_EVENT.DISCONNECTED, BT_EVENT.WEB_SCAN_ENDED].includes(e.type)) {
        if ((bt_connect_pending == addr) || ((e.type == BT_EVENT.WEB_SCAN_ENDED) && bt_scan_confirmed)) {
            bt_connect_pending = null;
        }
    }
    if (e.type == BT_EVENT.WEB_SCAN_STARTED) {
        bt_scan_confirmed = bt_scanning;
    }
    if ((e.type == BT_EVENT.WEB_SCAN_ENDED) && bt_scan_confirmed) {
        bt_scanning = false;
        bt_scan_confirmed = false;
    }
}

function file_uploaded() {
    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const new_config = JSON.parse(e.target.result);
            check_json_version(new_config['version']);
            config = new_config;
            set_ui_state();
            validate_ui_expressions();
            switch_to_mappings_tab();
        } catch (e) {
            display_error(e);
        }
    };

    const file = document.getElementById("file_input").files[0];
    if (file !== undefined) {
        reader.readAsText(file);
    }

    document.getElementById("file_input").value = '';
}

async function send_feature_command(command, fields = [], version = CONFIG_VERSION) {
    let buffer = new ArrayBuffer(CONFIG_SIZE);
    let dataview = new DataView(buffer);
    dataview.setUint8(0, version);
    dataview.setUint8(1, command);
    let pos = 2;
    for (const [type, value] of fields) {
        switch (type) {
            case UINT8:
                dataview.setUint8(pos, value);
                pos += 1;
                break;
            case UINT16:
                dataview.setUint16(pos, value, true);
                pos += 2;
                break;
            case UINT32:
                dataview.setUint32(pos, value, true);
                pos += 4;
                break;
            case INT32:
                dataview.setInt32(pos, value, true);
                pos += 4;
                break;
        }
    }
    add_crc(dataview);

    await device.sendFeatureReport(REPORT_ID_CONFIG, buffer);
}

async function read_config_feature(fields = []) {
    let attempts_left = 10;
    let delay = 2;
    let data;
    while (true) {
        const data_with_report_id = await device.receiveFeatureReport(REPORT_ID_CONFIG);
        data = new DataView(data_with_report_id.buffer, 1);
        if (data.byteLength > 0) {
            break;
        } else {
            if ((--attempts_left) > 0) {
                await (new Promise(resolve => setTimeout(resolve, delay)));
                delay *= 2;
                continue;
            }
            throw new Error('Error in read_config_feature (given up retrying).');
        }
    }
    check_crc(data);
    let ret = [];
    let pos = 0;
    for (const type of fields) {
        switch (type) {
            case UINT8:
                ret.push(data.getUint8(pos));
                pos += 1;
                break;
            case UINT16:
                ret.push(data.getUint16(pos, true));
                pos += 2;
                break;
            case UINT32:
                ret.push(data.getUint32(pos, true));
                pos += 4;
                break;
            case INT32:
                ret.push(data.getInt32(pos, true));
                pos += 4;
                break;
        }
    }
    return ret;
}

function clear_error() {
    document.getElementById("error").classList.add("d-none");
}

function display_error(message) {
    document.getElementById("error").innerText = message;
    document.getElementById("error").classList.remove("d-none");
}

function display_error_html(message) {
    document.getElementById("error").innerHTML = message;
    document.getElementById("error").classList.remove("d-none");
}

function check_crc(data) {
    if (data.getUint32(CONFIG_SIZE - 4, true) != crc32(data, CONFIG_SIZE - 4)) {
        throw new Error('CRC error.');
    }
}

function add_crc(data) {
    data.setUint32(CONFIG_SIZE - 4, crc32(data, CONFIG_SIZE - 4), true);
}

function check_json_version(config_version) {
    if (!([3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].includes(config_version))) {
        throw new Error("Incompatible version.");
    }
}

function check_received_version(config_version) {
    if (config_version != CONFIG_VERSION) {
        throw new Error("Incompatible version.");
    }
}

async function check_device_version() {
    // For versions <=3, this isn't a reliable way of checking the config version of the
    // device because it could be version X, ignore our GET_CONFIG call with version Y and
    // just happen to have Y at the right place in the buffer from some previous call done
    // by some other software.
    for (const version of [CONFIG_VERSION, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2]) {
        await send_feature_command(GET_CONFIG, [], version);
        const [received_version] = await read_config_feature([UINT8]);
        if (received_version == version) {
            if (version == CONFIG_VERSION) {
                return true;
            }
            display_error_html('<p>Incompatible version (' + version + ').</p>' +
                '<p>Please consider upgrading your HID Remapper firmware to the <a href="https://github.com/jfedor2/hid-remapper/releases/latest">latest version</a>.</p>' +
                '<p>Alternatively, click <a href="v' + version + '/">here</a> for an older version of the configuration tool that should be compatible with your device.</p>' +
                '<p class="mb-0">(You can also use the older version of the configuration tool to put your HID Remapper in firmware flashing mode and upgrade the firmware.)</p>');
            return false;
        }
    }

    display_error_html('<p>Incompatible version.</p><p class="mb-0">You might have a newer version of the firmware on your HID Remapper than this configuration tool was made for.</p>');
    return false;
}

function clear_children(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

function delete_mapping(mapping, element) {
    return function () {
        config['mappings'] = config['mappings'].filter(x => x !== mapping);
        document.getElementById("mappings").removeChild(element);
    };
}

function sticky_onclick(mapping, element) {
    return function () {
        mapping['sticky'] = element.checked;
        set_forced_layers(mapping, element.closest(".mapping_container"));
    };
}

function tap_onclick(mapping, element) {
    return function () {
        mapping['tap'] = element.checked;
    };
}

function hold_onclick(mapping, element) {
    return function () {
        mapping['hold'] = element.checked;
    };
}

function scaling_onchange(mapping, element) {
    return function () {
        mapping['scaling'] = element.value === '' ? DEFAULT_SCALING : Math.round(parseFloat(element.value) * 1000);
    };
}

function layer_checkbox_onchange(mapping, element, layer) {
    return function () {
        if (element.checked) {
            if (!mapping['layers'].includes(layer)) {
                mapping['layers'].push(layer)
                mapping['layers'].sort();
            }
        } else {
            mapping['layers'] = mapping['layers'].filter((x) => x != layer);
        }
    };
}

function expression_onchange(i) {
    const ui_to_json = function (op) {
        if (op.startsWith('/*')) {
            return op;
        }
        if (op.toLowerCase().startsWith('0x')) {
            if (isNaN(parseInt(op, 16))) {
                throw new Error('Invalid expression: "' + op + '"');
            }
            return op;
        }
        if (/^[0-9-]/.test(op)) {
            const x = parseFloat(op);
            if (isNaN(x)) {
                throw new Error('Invalid expression: "' + op + '"');
            }
            return Math.round(x * 1000).toString();
        }
        if ((op.toUpperCase() in ops) && !['PUSH', 'PUSH_USAGE'].includes(op.toUpperCase())) {
            return op.toLowerCase();
        }
        throw new Error('Invalid expression: "' + op + '"');
    }

    return function () {
        const expr_input = document.getElementById('expression_' + i).querySelector('.expression_input');
        try {
            config['expressions'][i] =
                [...expr_input.value.matchAll(expr_re).map(x => [
                    x[1],
                    ...x[2].replace(/\n/g, " eol ").split(/\s+/)
                ])].flat().filter((x) => (x.length > 0)).map(ui_to_json).join(' ');
            expr_input.classList.remove('is-invalid');
        } catch (e) {
            expr_input.classList.add('is-invalid');
            config['expressions'][i] = '';
        }
    }
}

function show_usage_modal(mapping_, source_or_target, element_) {
    return function () {
        // When set_mappings_ui_state() recreates the elements, it will update modal_return_element to
        // the correct element for the mapping we save in modal_return_mapping here.
        modal_return_mapping = mapping_;
        modal_return_element = element_;
        // XXX it would be better not to do this every time we show the modal
        const modal_element = document.getElementById(
            (source_or_target == 'source' ? 'source' : 'target') + '_usage_modal');
        const modal_ = source_or_target == 'source' ? source_modal : target_modal;
        modal_element.querySelectorAll('.usage_button').forEach((button) => {
            let clone = button.cloneNode(true);
            button.parentNode.replaceChild(clone, button); // to clear existing event listeners
            clone.addEventListener("click", function () {
                const mapping = modal_return_mapping;
                const element = (source_or_target == 'macro_item') ? modal_return_element :
                    modal_return_element.querySelector('.' + source_or_target + '_button');
                let usage = clone.getAttribute('data-hid-usage');
                if (mapping !== null) {
                    mapping[source_or_target + '_usage'] = usage;
                }
                element.querySelector('.button_label').innerText =
                    source_or_target == "source" ? readable_usage_name(usage) : readable_target_usage_name(usage);

                element.title = usage;

                if (source_or_target == "target") {
                    set_forced_layers(mapping, element.closest(".mapping_container"));
                }

                if (source_or_target == "source") {
                    set_forced_flags(mapping, element.closest(".mapping_container"));
                }

                if (source_or_target == "macro_item") {
                    element.setAttribute('data-hid-usage', usage);
                    set_macros_config_from_ui_state();
                }

                modal_.hide();
            });
        });
        const hub_port_container = modal_element.querySelector('.hub_port_container');
        if (source_or_target == "macro_item") {
            hub_port_container.querySelectorAll('.hub_port_inputs').forEach((x) => x.classList.add('d-none'));
        } else {
            if (source_or_target == "target") {
                hub_port_container.querySelectorAll('.hub_port_inputs').forEach((x) => x.classList.remove('d-none'));
            }
            const hub_port_dropdown = hub_port_container.querySelector('.hub_port_dropdown');
            const clone = hub_port_dropdown.cloneNode(true);
            hub_port_dropdown.parentElement.replaceChild(clone, hub_port_dropdown); // to clear existing event listeners
            clone.value = mapping_[source_or_target + '_port'];
            clone.addEventListener("change", function () {
                const mapping = modal_return_mapping;
                const element = modal_return_element.querySelector('.' + source_or_target + '_button');
                const hub_port = parseInt(clone.value, 10)
                set_port_badge(element, hub_port);
                mapping[source_or_target + '_port'] = hub_port;
            });
        }
        modal_.show();
    };
}

function add_empty_mapping(source_usage = '0x00000000') {
    let new_mapping = {
        'source_usage': source_usage,
        'target_usage': '0x00000000',
        'layers': [0],
        'sticky': false,
        'tap': false,
        'hold': false,
        'scaling': DEFAULT_SCALING,
        'source_port': 0,
        'target_port': 0,
    };
    config['mappings'].push(new_mapping);
    add_mapping(new_mapping);
}

function add_mapping_onclick() {
    add_empty_mapping();
}

function map_this_onclick(usage) {
    return function () {
        add_empty_mapping(usage);
        switch_to_mappings_tab();
        // XXX scroll to bottom and flash the mapping if we know how?
    }
}

function set_label_groups_visibility() {
    document.getElementById('source_usage_modal').querySelector('.mouse_usages').classList.toggle('d-none', config['input_labels'] != 0);
    document.getElementById('source_usage_modal').querySelector('.gamepad_usages').classList.toggle('d-none', config['input_labels'] != 1);
    usage_search_onchange(document.getElementById('source_usage_modal').querySelector('.usage_search_box'))();
}

function setup_usages_modals() {
    setup_usage_modal('source');
    setup_usage_modal('target');
    set_label_groups_visibility();
}

function setup_usage_modal(source_or_target) {
    const modal_element = document.getElementById(source_or_target + '_usage_modal');
    let usage_classes = {
        'mouse': modal_element.querySelector('.mouse_usages'),
        'gamepad': modal_element.querySelector('.gamepad_usages'),
        'keyboard': modal_element.querySelector('.keyboard_usages'),
        'media': modal_element.querySelector('.media_usages'),
        'other': modal_element.querySelector('.other_usages'),
        'extra': modal_element.querySelector('.extra_usages'),
    };
    for (const [usage_class, element] of Object.entries(usage_classes)) {
        clear_children(element);
    }
    let template = document.getElementById('usage_button_template');
    const add_usage_buttons = (relevant_usages) => {
        for (const [usage, usage_def] of Object.entries(relevant_usages)) {
            let clone = template.content.cloneNode(true).firstElementChild;
            clone.innerText = usage_def['name'];
            clone.title = usage;
            clone.setAttribute('data-hid-usage', usage);
            usage_classes[usage_def['class']].appendChild(clone);
        }
    }

    let known_usages;
    if (source_or_target == 'source') {
        add_usage_buttons(usages['source_0']);
        add_usage_buttons(usages['source_1']);
        add_usage_buttons(usages['source']);
        known_usages = { ...usages['source_0'], ...usages['source_1'], ...usages['source'] };
    } else {
        add_usage_buttons(usages[config['our_descriptor_number']]);
        known_usages = usages[config['our_descriptor_number']];
    }

    for (const usage_ of extra_usages[source_or_target]) {
        if (!(usage_ in known_usages)) {
            let clone = template.content.cloneNode(true).firstElementChild;
            clone.innerText = readable_usage_name(usage_);
            clone.title = usage_;
            clone.setAttribute('data-hid-usage', usage_);
            usage_classes['extra'].appendChild(clone);
        }
    }

    const search_box = modal_element.querySelector('.usage_search_box');
    search_box.addEventListener("keyup", usage_search_onchange(search_box));
    search_box.addEventListener("keydown", (e) => {
        if (e.key == 'Enter') {
            modal_element.querySelectorAll('.usage_button').forEach((usage_button) => {
                if (usage_button.hasAttribute('data-preferred-result')) {
                    usage_button.click();
                }
            });
        }
    });
    modal_element.addEventListener('show.bs.modal', () => {
        search_box.value = "";
        usage_search_onchange(search_box)();
    });
    modal_element.addEventListener('shown.bs.modal', () => {
        search_box.focus();
    });
}

function setup_macros() {
    const macros_container = document.getElementById('macros_container');
    let template = document.getElementById('macro_template');
    for (let i = 0; i < NMACROS; i++) {
        let clone = template.content.cloneNode(true).firstElementChild;
        clone.id = 'macro_' + i;
        clone.querySelector('.accordion-button').setAttribute('data-bs-target', '#collapse_' + i);
        clone.querySelector('.accordion-button').querySelector('.macro_name').innerText = 'Macro ' + (i + 1);
        clone.querySelector('.accordion-collapse').id = 'collapse_' + i;
        clone.querySelector('.add_macro_entry').addEventListener("click", () => {
            const entry_element = add_macro_entry(clone);
            add_macro_item(entry_element);
            set_macros_config_from_ui_state();
        });
        macros_container.appendChild(clone);
    }
}

function add_macro_entry(element) {
    const template = document.getElementById('macro_entry_template');
    const clone = template.content.cloneNode(true).firstElementChild;
    clone.querySelector('.add_macro_item').addEventListener("click", () => {
        add_macro_item(clone);
        set_macros_config_from_ui_state();
    });
    element.querySelector('.macro_entries').appendChild(clone);
    return clone;
}

function add_macro_item(element) {
    const template = document.getElementById('macro_item_template');
    const clone = template.content.cloneNode(true).firstElementChild;
    const button = clone.querySelector('.macro_item_usage');
    button.addEventListener("click", show_usage_modal(null, 'macro_item', button));
    clone.querySelector('.delete_macro_item').addEventListener("click", () => {
        delete_macro_item(clone);
        set_macros_config_from_ui_state();
    });
    element.insertBefore(clone, element.querySelector(".add_item_container"));
    return clone;
}

function delete_macro_item(element) {
    const parent = element.parentNode;
    parent.removeChild(element);
    if (parent.querySelectorAll('.macro_item').length == 0) {
        const macro_entry = parent.closest('.macro_entry');
        macro_entry.parentNode.removeChild(macro_entry);
    }
}

function set_macros_config_from_ui_state() {
    config['macros'] = [];
    for (let i = 0; i < NMACROS; i++) {
        let macro = [];
        const macro_element = document.querySelector('#macro_' + i);
        for (const entry_element of macro_element.querySelectorAll('.macro_entry')) {
            let entry = [];
            for (const item_element of entry_element.querySelectorAll('.macro_item_usage')) {
                const usage = item_element.getAttribute('data-hid-usage');
                if (usage != '0x00000000') {
                    entry.push(usage);
                }
            }
            macro.push(entry);
        }
        config['macros'].push(macro);
    }

    set_macro_previews();
}

function setup_expressions() {
    const expr_container = document.getElementById('expressions_container');
    let template = document.getElementById('expression_template');
    for (let i = 0; i < NEXPRESSIONS; i++) {
        let clone = template.content.cloneNode(true).firstElementChild;
        clone.id = 'expression_' + i;
        clone.querySelector('.expression_label').innerText = 'Expression ' + (i + 1);
        clone.querySelector('.expression_input').addEventListener("input", expression_onchange(i));
        expr_container.appendChild(clone);
    }
}

function partial_scroll_timeout_onchange() {
    let value = document.getElementById('partial_scroll_timeout_input').value;
    if (value === '') {
        value = DEFAULT_PARTIAL_SCROLL_TIMEOUT;
    } else {
        value = Math.round(value * 1000);
    }
    config['partial_scroll_timeout'] = value;
}

function tap_hold_threshold_onchange() {
    let value = document.getElementById('tap_hold_threshold_input').value;
    if (value === '') {
        value = DEFAULT_TAP_HOLD_THRESHOLD;
    } else {
        value = Math.round(value * 1000);
    }
    config['tap_hold_threshold'] = value;
}

function gpio_debounce_time_onchange() {
    let value = parseInt(document.getElementById('gpio_debounce_time_input').value, 10);
    if (isNaN(value)) {
        value = DEFAULT_GPIO_DEBOUNCE_TIME;
    }
    config['gpio_debounce_time_ms'] = value;
}

function unmapped_passthrough_onchange() {
    config['unmapped_passthrough_layers'] = [];
    for (let i = 0; i < NLAYERS; i++) {
        if (document.getElementById("unmapped_passthrough_checkbox" + i).checked) {
            config['unmapped_passthrough_layers'].push(i);
        }
    }
}

function interval_override_onchange() {
    config['interval_override'] = parseInt(document.getElementById("interval_override_dropdown").value, 10);
}

function our_descriptor_number_onchange() {
    config['our_descriptor_number'] = parseInt(document.getElementById("our_descriptor_number_dropdown").value, 10);
    set_ui_state();
}

function gpio_output_mode_onchange() {
    config['gpio_output_mode'] = parseInt(document.getElementById("gpio_output_mode_dropdown").value, 10);
}

function ignore_auth_dev_inputs_onchange() {
    config['ignore_auth_dev_inputs'] = document.getElementById("ignore_auth_dev_inputs_checkbox").checked;
}

function normalize_gamepad_inputs_onchange() {
    config['normalize_gamepad_inputs'] = document.getElementById("normalize_gamepad_inputs_checkbox").checked;
}

function macro_entry_duration_onchange() {
    let value = parseInt(document.getElementById("macro_entry_duration_input").value, 10);
    if (isNaN(value)) {
        value = DEFAULT_MACRO_ENTRY_DURATION;
    }
    if (value < 1) {
        value = 1;
    }
    if (value > 256) {
        value = 256;
    }
    config['macro_entry_duration'] = value;
}

function input_labels_onchange(element_id) {
    return function () {
        config['input_labels'] = parseInt(document.getElementById(element_id).value, 10);
        document.getElementById("input_labels_dropdown").value = config['input_labels'];
        document.getElementById("input_labels_modal_dropdown").value = config['input_labels'];
        set_mappings_ui_state();
        set_label_groups_visibility();
    }
}

function load_example(n) {
    config = structuredClone(examples[n]['config']);
    set_ui_state();
    validate_ui_expressions();
    switch_to_mappings_tab();
}

function setup_examples() {
    const element = document.getElementById("examples");
    const template = document.getElementById("example_template");
    for (let i = 0; i < examples.length; i++) {
        const clone = template.content.cloneNode(true).firstElementChild;
        const link = clone.querySelector('a');
        link.innerText = examples[i]['description'];
        link.addEventListener("click", () => load_example(i));
        element.appendChild(clone);
    }
}

function hid_on_disconnect(event) {
    if (event.device === device) {
        device = null;
        bt_scanning = false;
        bt_connect_pending = null;
        device_buttons_set_disabled_state(true);
    }
}

function device_buttons_set_disabled_state(state) {
    document.getElementById("load_from_device").disabled = state;
    document.getElementById("save_to_device").disabled = state;
    document.getElementById("flash_firmware").disabled = state;
    document.getElementById("flash_b_side").disabled = state;
    document.getElementById("clear_bonds").disabled = state;
}

function bluetooth_buttons_set_visibility(visible) {
    if (!visible) {
        document.getElementById("paired_devices_container").classList.add("d-none");
        document.getElementById("bt_scan_container").classList.add("d-none");
    } else if (document.getElementById("nav-actions-tab").classList.contains("active")) {
        actions_tab_shown();
    }
    document.getElementById("clear_bonds_container").classList.toggle("d-none", !visible);
    document.getElementById("flash_b_side_container").classList.toggle("d-none", visible);
}

function mask_to_layer_list(layer_mask) {
    let layers = [];
    for (let i = 0; i < NLAYERS; i++) {
        if ((layer_mask & (1 << i)) != 0) {
            layers.push(i);
        }
    }
    return layers;
}

function layer_list_to_mask(layers) {
    let layer_mask = 0;

    for (const layer of layers) {
        layer_mask |= (1 << layer);
    }

    return layer_mask;
}

function readable_usage_name(usage, default_to_hex = true) {
    if (usage in usages['source_' + config['input_labels']]) {
        return usages['source_' + config['input_labels']][usage]['name'];
    }
    if (usage in usages['source']) {
        return usages['source'][usage]['name'];
    }
    if (usage in usages['source_extra']) {
        return usages['source_extra'][usage]['name'];
    }
    if (((usage & 0xFFFF0000) >>> 0) == BUTTON_USAGE_PAGE) {
        return 'Button ' + (usage & 0xFFFF);
    }
    if (((usage & 0xFFFF0000) >>> 0) == MIDI_USAGE_PAGE) {
        const status = (usage >> 8) & 0xF0;
        const channel = (usage >> 8) & 0x0F;
        const prefix = 'MIDI CH' + channel;
        switch (status) {
            case 0x90:
                return prefix + ' note ' + (usage & 0xFF);
            case 0xA0:
                return prefix + ' PKP ' + (usage & 0xFF);
            case 0xB0:
                return prefix + ' CC' + (usage & 0xFF);
            case 0xC0:
                return prefix + ' program';
            case 0xD0:
                return prefix + ' CP';
            case 0xE0:
                return prefix + ' PB';
        }
    }
    return default_to_hex ? usage : '';
}

function readable_target_usage_name(usage) {
    return (usage in usages[config['our_descriptor_number']]) ? usages[config['our_descriptor_number']][usage]['name'] : usage;
}

function set_forced_layers(mapping, mapping_container) {
    for (let i = 0; i < NLAYERS; i++) {
        mapping_container.querySelector(".layer_checkbox" + i).disabled = false;
    }
    const usage_int = parseInt(mapping['target_usage'], 16);
    if (((usage_int & 0xFFFF0000) >>> 0) == LAYERS_USAGE_PAGE) {
        const layer = usage_int & 0xFFFF;
        const layer_checkbox = mapping_container.querySelector(".layer_checkbox" + layer);
        if (mapping['sticky']) {
            mapping['layers'] = mapping['layers'].filter((x) => x != layer);
            layer_checkbox.checked = false;
        } else {
            if (!mapping['layers'].includes(layer)) {
                mapping['layers'].push(layer)
                mapping['layers'].sort();
            }
            layer_checkbox.checked = true;
        }
        layer_checkbox.disabled = true;
    }
}

function set_forced_flags(mapping, mapping_container) {
    mapping_container.querySelector(".sticky_checkbox").disabled = false;
    mapping_container.querySelector(".tap_checkbox").disabled = false;
    mapping_container.querySelector(".hold_checkbox").disabled = false;
    const usage_int = parseInt(mapping['source_usage'], 16);
    if (((usage_int & 0xFFFF0000) >>> 0) == EXPR_USAGE_PAGE) {
        mapping_container.querySelector(".sticky_checkbox").checked = false;
        mapping_container.querySelector(".tap_checkbox").checked = false;
        mapping_container.querySelector(".hold_checkbox").checked = false;
        mapping_container.querySelector(".sticky_checkbox").disabled = true;
        mapping_container.querySelector(".tap_checkbox").disabled = true;
        mapping_container.querySelector(".hold_checkbox").disabled = true;
        mapping['sticky'] = false;
        mapping['tap'] = false;
        mapping['hold'] = false;
    }
}

function switch_to_mappings_tab() {
    bootstrap.Tab.getOrCreateInstance(document.getElementById("nav-mappings-tab")).show();
}

function expr_to_elems(expr) {
    const convert_elem = function (elem) {
        if (elem.toLowerCase().startsWith('0x')) {
            return [ops["PUSH_USAGE"], parseInt(elem, 16)];
        }
        if (/^[0-9-]/.test(elem)) {
            return [ops["PUSH"], parseInt(elem, 10)];
        }
        if (elem.toUpperCase() in ops) {
            return [ops[elem.toUpperCase()]];
        }
        throw new Error('Invalid expression: "' + elem + '"');
    }

    return [...expr.matchAll(expr_re).map(x => x[2])].join('').split(/\s+/).filter((x) => (x.length > 0)).map(convert_elem);
}

function validate_ui_expressions() {
    for (let i = 0; i < NEXPRESSIONS; i++) {
        expression_onchange(i)();
    }
}

function input_report_received(event) {
    if (event.reportId == REPORT_ID_MONITOR) {
        document.querySelectorAll('.monitor_row').forEach((element) => {
            element.classList.remove('bg-light');
        });
        for (let i = 0; i < 7; i++) {
            const usage = "0x" + event.data.getUint32(i * 9, true).toString(16).padStart(8, "0");
            const value = event.data.getInt32(i * 9 + 4, true);
            const hub_port = event.data.getUint8(i * 9 + 8);
            if (usage != 0) {
                update_monitor_ui(usage, value, hub_port);
            }
        }
    }
}

function update_monitor_ui(usage, value, hub_port) {
    const element_id = 'monitor_usage_' + usage + '_' + hub_port;
    let element = document.getElementById(element_id);
    if (element == null) {
        const template = document.getElementById("monitor_template");
        const container = document.getElementById("monitor_container");
        element = template.content.cloneNode(true).firstElementChild;
        element.querySelector('.monitor_usage .usage_label').innerText = usage;
        const port_badge = element.querySelector('.monitor_usage .hub_port_badge');
        port_badge.innerText = hub_port;
        if ((hub_port == 0) || (hub_port == HUB_PORT_NONE)) {
            port_badge.classList.add('d-none');
        } else {
            port_badge.classList.remove('d-none');
        }
        element.querySelector('.monitor_readable_name').innerText = readable_usage_name(usage, false);
        element.querySelector('.map_this_button').addEventListener("click", map_this_onclick(usage));
        element.id = element_id;
        container.appendChild(element);
    }

    document.getElementById('monitor_header').classList.remove('d-none');

    element.querySelector('.monitor_last_value').innerText = value;
    element.classList.add('bg-light');
    const key = usage + '_' + hub_port;
    if (!(key in monitor_min_val) || (value < monitor_min_val[key])) {
        monitor_min_val[key] = value;
        element.querySelector('.monitor_min_value').innerText = value;
    }
    if (!(key in monitor_max_val) || (value > monitor_max_val[key])) {
        monitor_max_val[key] = value;
        element.querySelector('.monitor_max_value').innerText = value;
    }
}

function monitor_clear() {
    clear_children(document.getElementById("monitor_container"));
    document.getElementById('monitor_header').classList.add('d-none');
    monitor_min_val = {};
    monitor_max_val = {};
}

async function set_monitor_enabled(enabled) {
    monitor_enabled = enabled;
    if (device != null) {
        await send_feature_command(SET_MONITOR_ENABLED, [[UINT8, monitor_enabled ? 1 : 0]]);
    }
}

async function monitor_tab_shown(event) {
    await set_monitor_enabled(true);
}

async function monitor_tab_hide(event) {
    await set_monitor_enabled(false);
}

function add_quirk(quirk) {
    const template = document.getElementById("quirk_template");
    const container = document.getElementById("quirks_container");
    const clone = template.content.cloneNode(true).firstElementChild;
    clone.querySelector(".delete_button").addEventListener("click", delete_quirk(quirk, clone));
    const vendor_id_input = clone.querySelector('.vendor_id_input');
    vendor_id_input.value = quirk['vendor_id'].replace(/^0[xX]/, '');
    vendor_id_input.addEventListener("change", quirk_hex_change('vendor_id', quirk, vendor_id_input));
    const product_id_input = clone.querySelector('.product_id_input');
    product_id_input.value = quirk['product_id'].replace(/^0[xX]/, '');
    product_id_input.addEventListener("change", quirk_hex_change('product_id', quirk, product_id_input));
    const interface_input = clone.querySelector('.interface_input');
    interface_input.value = quirk['interface'];
    interface_input.addEventListener("change", quirk_number_change('interface', quirk, interface_input));
    const report_id_input = clone.querySelector('.report_id_input');
    report_id_input.value = quirk['report_id'];
    report_id_input.addEventListener("change", quirk_number_change('report_id', quirk, report_id_input));
    const usage_input = clone.querySelector('.usage_input');
    usage_input.value = quirk['usage'].replace(/^0[xX]/, '');
    usage_input.addEventListener("change", quirk_hex_change('usage', quirk, usage_input));
    const size_input = clone.querySelector('.size_input');
    size_input.value = quirk['size'];
    size_input.addEventListener("change", quirk_number_change('size', quirk, size_input));
    const bitpos_input = clone.querySelector('.bitpos_input');
    bitpos_input.value = quirk['bitpos'];
    bitpos_input.addEventListener("change", quirk_number_change('bitpos', quirk, bitpos_input));
    const relative_checkbox = clone.querySelector(".relative_checkbox");
    relative_checkbox.checked = quirk['relative'];
    relative_checkbox.id = 'relative_checkbox' + unique_id_counter++;
    relative_checkbox.addEventListener("change", quick_checkbox_onclick('relative', quirk, relative_checkbox));
    clone.querySelector(".relative_checkbox_label").htmlFor = relative_checkbox.id;
    const signed_checkbox = clone.querySelector(".signed_checkbox");
    signed_checkbox.checked = quirk['signed'];
    signed_checkbox.id = 'signed_checkbox' + unique_id_counter++;
    signed_checkbox.addEventListener("change", quick_checkbox_onclick('signed', quirk, signed_checkbox));
    clone.querySelector(".signed_checkbox_label").htmlFor = signed_checkbox.id;
    container.appendChild(clone);
}

function quirk_hex_change(field_name, quirk, element) {
    return function () {
        if (/^[0-9a-fA-F]+$/.test(element.value)) {
            element.classList.remove('is-invalid');
            quirk[field_name] = '0x' + element.value;
        } else {
            element.classList.add('is-invalid');
            quirk[field_name] = '0x0000';
        }
    };
}

function quirk_number_change(field_name, quirk, element) {
    return function () {
        const value = parseInt(element.value, 10);
        if (isNaN(value)) {
            element.classList.add('is-invalid');
            quirk[field_name] = 0;
        } else {
            quirk[field_name] = value;
            element.classList.remove('is-invalid');
        }
    };
}

function quick_checkbox_onclick(field_name, quirk, element) {
    return function () {
        quirk[field_name] = element.checked;
    };
}

function add_empty_quirk() {
    let quirk = {
        "vendor_id": "0x0000",
        "product_id": "0x0000",
        "interface": 0,
        "report_id": 0,
        "usage": "0x00000000",
        "size": 0,
        "bitpos": 0,
        "relative": false,
        "signed": false
    };
    config['quirks'].push(quirk);
    add_quirk(quirk);
}

function delete_quirk(quirk, element) {
    return function () {
        config['quirks'] = config['quirks'].filter(x => x !== quirk);
        document.getElementById("quirks_container").removeChild(element);
    };
}

function set_quirks_ui_state() {
    clear_children(document.getElementById('quirks_container'));
    for (const quirk of config['quirks']) {
        add_quirk(quirk);
    }
}

function comparison_function(fields) {
    return (a, b) => {
        for (const field of fields) {
            if (a[field] < b[field]) {
                return -1;
            }
            if (a[field] > b[field]) {
                return 1;
            }
        }
        return 0;
    };
}

function sort_by(fields) {
    return (e) => {
        e.preventDefault();
        config['mappings'].sort(comparison_function(fields));
        set_mappings_ui_state();
    };
}

function usage_search_onchange(element) {
    return () => {
        const query = element.value.toLowerCase().replaceAll(" ", "");
        const modal_element = element.closest('.modal');
        let exact_match = null;
        let last_match = null;
        let hits = 0;
        modal_element.querySelectorAll('.usage_button').forEach((usage_button) => {
            const label = usage_button.innerText.toLowerCase().replaceAll(" ", "");
            usage_button.classList.toggle('d-none', !label.includes(query));
            usage_button.removeAttribute('data-preferred-result');
            if (label.includes(query)) {
                hits++;
                last_match = usage_button;
            }
            if (label == query) {
                exact_match = usage_button;
            }
        });
        let have_preferred_result = false;
        if (exact_match) {
            exact_match.setAttribute('data-preferred-result', "1");
            have_preferred_result = true;
        } else {
            if (hits == 1) {
                last_match.setAttribute('data-preferred-result', "1");
                have_preferred_result = true;
            }
        }
        element.closest('div').querySelector('.have_preferred_result_checkmark').classList.toggle('d-none', !have_preferred_result);
    }
}